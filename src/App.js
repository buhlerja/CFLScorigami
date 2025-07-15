import React, { useState, useEffect } from "react";
import ScorigamiGrid from './Scorigami';
import AdditionalInfoView from "./AdditionalInfoView";
import AllTimeRecordsView from './AllTimeRecordsView';

import './App.css';
//import * as XLSX from 'xlsx'; // Import the XLSX library
import axios from 'axios';

const SHEET_ID = '1l6-gLrur2ObZUD7DiEboNzhvFT-GMD2YECGIqoIndIk'
const API_KEY = 'AIzaSyBW30DpZgLKVe37DgWsVK506-88z_GkOvc'

const fetchSheetData = async () => {
  const range = 'Sheet1!A1:H6000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    
    // Log the response to check the data structure
    console.log('Response Data:', response.data);
    
    const data = response.data.values;
    const data_filtered = data.slice(1);
    if (data_filtered && data_filtered.length > 0) {
      // Proceed with processing data
      console.log(data_filtered);
      return data_filtered;
    } else {
      console.error('Data is undefined or empty');
    }
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
};


function groupGameDataByScore(gameData) {
  const groupedData = {};

  gameData.forEach(row => {
    const [winningTeam, losingTeam, winningScore, losingScore, homeTeam, date, week, year] = row;

    const key = `${winningScore}-${losingScore}`;

    if (!groupedData[key]) {
      groupedData[key] = [];
    }

    groupedData[key].push([winningTeam, losingTeam, homeTeam, date, week, year]);
  });

  return groupedData;
}

function getFrequencyData(gameData) {
  const frequencyData = {}
  gameData.forEach(row => {
    const [ , , winningScore, losingScore, , , , ] = row; // Only need winningScore and losingScore

    const key = `${winningScore}-${losingScore}`;

    if(!frequencyData[key]) {
      frequencyData[key] = 0;
    }

    frequencyData[key] = frequencyData[key] + 1;
  });

  return frequencyData;
}

function getScorigamiByYear(gameData) {
  const scorigamiByYear = {} // Key is YEAR. Value is [Prev Year Scorigamis, Year's Scorigamis]. Each element's format is (Winning Score, Losing Score)
  const existingScores = []
  gameData.forEach(row => {
    const [ , , winningScore, losingScore, , , , year] = row;
    const scoreTuple = [winningScore, losingScore];
    const key = year;

    if(!scorigamiByYear[key]) {
      const prevScores = [...existingScores]; // shallow copy of scores up to this year
      scorigamiByYear[key] = [prevScores, []];
    }

    if (!existingScores.some(([w, l]) => w === winningScore && l === losingScore)) {
      scorigamiByYear[key][1].push(scoreTuple);
      existingScores.push(scoreTuple);
    }

  });
  return scorigamiByYear;
}

function getAllTimeRecords(gameData) {
  const allTimeRecords = {}; // Key is CITY NAME. Value is [Wins, Losses, Ties]
  const cityNames = new Set(["Montreal", "Hamilton", "Ottawa", "Toronto", "Saskatchewan", "Winnipeg", "Calgary", "Edmonton", "BC"]);
  gameData.forEach(row => {
    const [winningTeam, losingTeam, winningScore, losingScore, , , , ,] = row;
    // Filter out the city name from winning team and losing team
    const winningCity = Array.from(cityNames).find(city => winningTeam.startsWith(city));
    const losingCity = Array.from(cityNames).find(city => losingTeam.startsWith(city));
    // Add to allTimeRecords
    const tie = winningScore === losingScore;
    if(winningCity) {
      if (!allTimeRecords[winningCity]) allTimeRecords[winningCity] = [0, 0, 0];
      if(tie) {
        allTimeRecords[winningCity][2] += 1;
      }
      else {
        allTimeRecords[winningCity][0] += 1;
      }
    }
    if(losingCity) {
      if (!allTimeRecords[losingCity]) allTimeRecords[losingCity] = [0, 0, 0];
      if(tie) {
        allTimeRecords[losingCity][2] += 1;
      }
      else {
        allTimeRecords[losingCity][1] += 1;
      }
    }
    
  });
  return allTimeRecords;
}

function App() {
  const [showFrequency, setShowFrequency] = useState(false); // State to toggle between grid and frequency view
  const [showNumbersFreq, setShowNumbersFreq] = useState(false); // State to toggle between showing frequency numbers on boxes
  const [scoreFrequencies, setScoreFrequencies] = useState([]); // Used to store score frequency data
  const [allGameData, setAllGameData] = useState([]); // Used to score the metadata around each individual score
  const [existingScores, setExistingScores] = useState([]);
  const [scorigamiByYear, setScorigamiByYear] = useState([]); // Scorigami's achieved in a particular key = year
  const [showScorigamiByYear, setShowScorigamiByYear] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(true); // Loading state
  const [allTimeRecords, setAllTimeRecords] = useState([]); // Contains all time win loss data for each team. Keys are city name. Values are [Wins, Losses, Ties]

  useEffect(() => {
    const fetchData = async () => {
      // Fetch data from the Google Sheets API
      const data = await fetchSheetData();
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Filter out any rows that are blank
        const parsedData = data.map(row => [row[2], row[3]]).filter(row => row[0] && row[1]); // Assuming "Winning Score" and "Losing Score" are in column 3 and 4
        const parsedData_forAllGameData = data
          .map(row => [
            row[0], // Winning Team
            row[1], // Losing Team
            row[2], // Winning Score
            row[3], // Losing Score
            row[4], // Home Team
            row[5], // Date
            row[6], // Week
            row[7], // Year
          ])
          .filter(row => row[0] && row[1] && row[2] && row[3]); // Filter rows with incomplete data

        setExistingScores(parsedData);
        const groupedByScore = groupGameDataByScore(parsedData_forAllGameData);
        setAllGameData(groupedByScore);
        const groupedByFrequency = getFrequencyData(parsedData_forAllGameData);
        setScoreFrequencies(groupedByFrequency);
        const groupedByScorigamiPerYear = getScorigamiByYear(parsedData_forAllGameData);
        setScorigamiByYear(groupedByScorigamiPerYear);
        const groupedByAllTimeRecords = getAllTimeRecords(parsedData_forAllGameData);
        setAllTimeRecords(groupedByAllTimeRecords);
        setLoading(false);
      } else {
        console.error("No data fetched.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFrequency = () => {
    const newShowFrequency = !showFrequency;
    setShowFrequency(newShowFrequency);
  
    // If we're turning frequency ON and scorigami is ON, turn scorigami OFF
    if (newShowFrequency && showScorigamiByYear) {
      setShowScorigamiByYear(false);
    }
  }

  const toggleShowNumbersFreq = () => {
    setShowNumbersFreq(!showNumbersFreq);
  }

  const toggleScorigamiByYear = () => {
    const newShowScorigamiByYear = !showScorigamiByYear;
    setShowScorigamiByYear(newShowScorigamiByYear);

    // If we're turning scorigami ON and frequency is ON, turn frequency OFF
    if (newShowScorigamiByYear && showFrequency) {
      setShowFrequency(false);
    }
  }

  return (
    <div className="container">
      <h1 className="title">CFL Scorigami</h1>

    <div className="button-group">
      <button className="styled-button" onClick={toggleFrequency}>
        {showFrequency ? "Hide Frequency Gradient" : "Show Frequency Gradient"}
      </button>

      <button className="styled-button" onClick={toggleShowNumbersFreq}>
        {showNumbersFreq ? "Hide Frequency Count" : "Show Frequency Count"}
      </button>

      <button className="styled-button" onClick={toggleScorigamiByYear}>
        {showScorigamiByYear ? "Hide Scorigami by Year" : "Show Scorigami by Year"}
      </button>

    </div>

    {/* Conditional rendering based on toggle */}
    {showScorigamiByYear && (
      <div className="scorigami-by-year-group">
        <div style={{ padding: '1rem' }}>
          <label htmlFor="yearRange">Select a Year: {selectedYear}</label>
          <input
            type="range"
            id="yearRange"
            min="1958"
            max="2025"
            step="1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ marginBottom: '1rem' }}> {/* Add space between items */}
            <p style={{ display: 'flex', alignItems: 'center' }}>
              {/* Square color indicator for previous years */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'grey',
                  marginRight: '10px',
                }}
              ></div>
              = Scorigami from a year previous to {selectedYear}
            </p>
          </div>

          <div>
            <p style={{ display: 'flex', alignItems: 'center' }}>
              {/* Square color indicator for the current year */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#DDA0DD',
                  marginRight: '10px',
                }}
              ></div>
              = Scorigami from the year {selectedYear}
            </p>
          </div>
        </div>
      </div>
    )}

      {loading ? (
        <p>Loading data...</p> // Show loading message while fetching
      ) : (
        <>
          <ScorigamiGrid 
          existing_scores={existingScores}
          score_frequencies={scoreFrequencies} 
          show_frequency={showFrequency} 
          show_numbers_freq={showNumbersFreq}
          all_game_data={allGameData}
          scorigami_by_year={scorigamiByYear}
          selected_year={selectedYear}
          show_scorigami_by_year={showScorigamiByYear}
          /> {/* Pass the data to ScorigamiGrid */}
        </>
      )}

      <div className="all-time-records">
        <AllTimeRecordsView all_time_records={allTimeRecords} />
      </div>


      <div className="additional-info">
        <AdditionalInfoView/>
      </div>
    </div>

  );
}

export default App;
