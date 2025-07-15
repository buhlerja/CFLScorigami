import os 
import requests
from bs4 import BeautifulSoup, NavigableString
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import pandas as pd

# NOTES: This system is for games 1958-1989 and may contain playoff data for this dates (will see)

# While the original script used CFLDB, the website has since gone out of business.
# This data is now sourced from the official CFL website

def extract_cfl_historical_scoring():
    year_range = [i for i in range(1958,2025)]
    all_game_data = [] # See format below
    for year in year_range:
        url = extract_yearly_url(year)
        extract_cfl_yearly_data(url, all_game_data, year)
    return all_game_data

def extract_yearly_url(year):
    return 'https://www.cfl.ca/schedule/' + str(year)

def extract_cfl_yearly_data(url, all_game_data, year):
    try:
        # Setup Selenium WebDriver
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)

        driver.get(url)
        time.sleep(3)  # Wait for JavaScript to load the page

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        driver.quit()

        # Search for all "<div class="schedule-week"></div>
            # Within all of these, find "<ul role="tablist" aria-multiselecttable="true" class="week-block collapsible" ...
            # Then inside this, there is a "<li role="tab" class="week-row"></li> for all games played that week
                # For each of these, go into "<div class="content collapsible-body qlook d-none"></div>
                # Within this, go to <div class="quicklook-wrapper"></div>
                # Within this, go to <div class="matchup"></div>
                # Within this, go to <div class="visitor"
                    #Within this, go to <div class="text"></div>
                    #Within this, fetch name from <div class="city js-data-team_2_location">
                    #Within this, fetch nickname from <div class="team js data-team_2_nickname"
                # Within this, go to <div class="host"
                    #Within this, go to <div class="text"></div>
                    #Within this, fetch name from <div class="city js-data-team_1_location">
                    #Within this, fetch nickname from <div class="team js data-team_1_nickname"
                # Within this, fetch visitor score from <div class="visitor-score js-data-team_2_score"> </div>
                # Within this, fetch host score from <div class="host-score js-data-team_1_score"> </div>
                # For each game: Append data to list with full team names e.g. "Winnipeg Blue Bombers"
                # Desired list format: ["Winning Team", "Losing Team", "Winning Score", "Losing Score", "Date", "Week", "Year"])
        
        weeks = soup.find_all('div', class_='schedule-week')

        for week in weeks:
            week_block = week.find('ul', class_='week-block')
            if not week_block:
                continue

            # Extract the week
            current_week = week.find('div', class_="week-info")
            current_week = current_week.find('h2').text

            games = week_block.find_all('li', class_='week-row')
            for game in games:
                # Get the game date
                # Extract the game date text (ignoring the <script>)
                date_span = game.find('span', class_='date')
                if date_span:
                    game_date = ''.join(t for t in date_span.contents if isinstance(t, NavigableString)).strip()
                else:
                    game_date = "Unknown"


                game_body = game.find('div', class_='content')
                if not game_body:
                    continue

                quicklook = game_body.find('div', class_='quicklook-wrapper')
                if not quicklook:
                    continue

                matchup = quicklook.find('div', class_='matchup')
                if not matchup:
                    continue

                # Visitor info
                visitor_div = matchup.find('div', class_='visitor')
                if visitor_div:
                    visitor_text = visitor_div.find('div', class_='text')
                    visitor_city = visitor_text.find('div', class_='city').get_text(strip=True)
                    visitor_team = visitor_text.find('div', class_='team').get_text(strip=True)
                    visitor_name = f"{visitor_city} {visitor_team}"
                    visitor_score = matchup.find('div', class_='visitor-score').get_text(strip=True)
                else:
                    visitor_name = visitor_score = ""

                # Host info
                host_div = matchup.find('div', class_='host')
                if host_div:
                    host_text = host_div.find('div', class_='text')
                    host_city = host_text.find('div', class_='city').get_text(strip=True)
                    host_team = host_text.find('div', class_='team').get_text(strip=True)
                    host_name = f"{host_city} {host_team}"
                    host_score = matchup.find('div', class_='host-score').get_text(strip=True)
                else:
                    host_name = host_score = ""

                # Determine winner and loser
                try:
                    v_score = int(visitor_score)
                    h_score = int(host_score)
                except ValueError:
                    # Skip game if scores aren't available
                    continue

                if v_score > h_score:
                    winning_team = visitor_name
                    losing_team = host_name
                    winning_score = v_score
                    losing_score = h_score
                else:
                    winning_team = host_name
                    losing_team = visitor_name
                    winning_score = h_score
                    losing_score = v_score

                # Append game data
                if(current_week != "Exhibition" 
                and current_week != "Preseason Week 1" 
                and current_week != "Preseason Week 2"
                and current_week != "Preseason Week 3"
                and current_week != "Preseason Week 4"):
                    print("Success with URL: ", url)
                    print("Appending: ", (winning_team, losing_team, winning_score, losing_score, game_date, current_week, year)) 
                    game_data = [
                        winning_team,
                        losing_team,
                        winning_score,
                        losing_score,
                        host_name,
                        game_date,
                        current_week,
                        year
                    ]
                    all_game_data.append(game_data)
                

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return []


# Call the function and print the result
match_data = extract_cfl_historical_scoring()
if match_data:
    df = pd.DataFrame(match_data, columns=["Winning Team", "Losing Team", "Winning Score", "Losing Score", "Home Team", "Date", "Week", "Year"])
    # Output file path
    output_file = "match_data_all.xlsx"
    # Check if the file already exists
    if os.path.exists(output_file):
        print(f"{output_file} already exists. The file will be overwritten.")
    else:
        print(f"Creating new file: {output_file}")
    # Save the data to Excel
    df.to_excel(output_file, index=False)
    print(f"Match data exported to {output_file}")
else:
    print("No match data found.")