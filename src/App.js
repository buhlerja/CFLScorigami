import React, { useState, useEffect } from "react";
import ScorigamiGrid from './Scorigami';
import './App.css';
import * as XLSX from 'xlsx'; // Import the XLSX library

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

function App() {
  const [showFrequency, setShowFrequency] = useState(false); // State to toggle between grid and frequency view
  const [showNumbersFreq, setShowNumbersFreq] = useState(false) // State to toggle between showing frequency numbers on boxes
  const [scoreFrequencies, setScoreFrequencies] = useState([]) // Used to store score frequency data
  const [allGameData, setAllGameData] = useState([]); // Used to score the metadata around each individual score
  const [existingScores, setExistingScores] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch data when the component mounts
  useEffect(() => {
    // Fetch the Excel file from the public folder
    fetch(`${process.env.PUBLIC_URL}/match_data_all.xlsx`)
      .then((response) => {
        console.log('File fetched successfully'); // Log when the file is fetched
        return response.arrayBuffer(); // Read the file as ArrayBuffer
      })
      .then((arrayBuffer) => {
        console.log('ArrayBuffer received:', arrayBuffer); // Log the arrayBuffer

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        console.log('Workbook read:', workbook); // Log the workbook object

        // Get the first sheet from the workbook
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Get the second frequency sheet from the workbook
        const sheetNameTwo = workbook.SheetNames[1];
        const sheetTwo = workbook.Sheets[sheetNameTwo];
        console.log('Sheet fetched:', sheetTwo); // Log the sheet object

        // Convert the sheet to JSON
        const rawData = XLSX.utils.sheet_to_json(sheet);
        //console.log('Raw data:', rawData); // Log the raw data from the sheet
        const rawDataTwo = XLSX.utils.sheet_to_json(sheetTwo);
        console.log('Raw data:', rawDataTwo); // Log the raw data from the sheet

        // Print each row individually to see the structure
        //rawData.forEach((row, index) => {
        //  console.log(`Row ${index + 1}:`, row); // Log each row in the sheet
        //});

        // Convert raw data into an array of tuples (winning team, losing team)
        const parsedData = rawData.map(row => [row["Winning Score"], row["Losing Score"]]);
        const parsedData_forAllGameData = rawData.map(row => [row["Winning Team"], row["Losing Team"], row["Winning Score"], row["Losing Score"], row["Home Team"], row["Date"], row["Week"], row["Year"]]);
        //console.log('Parsed data:', parsedData); // Log the parsed data
        const parsedDataTwo = rawDataTwo.map(row => [row["Winning Score"], row["Losing Score"], row["Frequency"]]);
        console.log('Parsed data:', parsedDataTwo); // Log the parsed data (two)

        // Set the parsed data to the state
        setExistingScores(parsedData);
        const groupedByScore = groupGameDataByScore(parsedData_forAllGameData);
        setAllGameData(groupedByScore);
        setScoreFrequencies(parsedDataTwo); 
        setLoading(false); // Set loading to false after data is fetched
        // Set the parse data to the state
        
      })
      .catch((error) => {
        console.error("Error fetching or parsing Excel file:", error);
      });
  }, []);

  const toggleFrequency = () => {
    setShowFrequency(!showFrequency);
  }

  const toggleShowNumbersFreq = () => {
    setShowNumbersFreq(!showNumbersFreq)
  }

  return (
    <div className="container">
      <h1 className="title">CFL Scorigami</h1>

      {/* Toggle Button to Show Frequency */}
      <button className="toggle-button" onClick={toggleFrequency}>
        {showFrequency ? "Hide Frequency Gradient" : "Show Frequency Gradient"}
      </button>

      {/* Toggle Button to Show Frequency */}
      <button className="toggle-button" onClick={toggleShowNumbersFreq}>
        {showNumbersFreq ? "Hide Frequency Numbers" : "Show Frequency Numbers"}
      </button>


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
          /> {/* Pass the data to ScorigamiGrid */}
        </>
      )}
    </div>
  );
}

export default App;
