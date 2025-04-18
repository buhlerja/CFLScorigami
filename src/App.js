import React, { useState, useEffect } from "react";
import ScorigamiGrid from './Scorigami';
import AdditionalInfoView from "./AdditionalInfoView";
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
    const [winningTeam, losingTeam, winningScore, losingScore, homeTeam, date, week, year] = row; // UNUSED VARS. Comp. warning

    const key = `${winningScore}-${losingScore}`;

    if(!frequencyData[key]) {
      frequencyData[key] = 0
    }

    frequencyData[key] = frequencyData[key] + 1;
  });

  return frequencyData;
}

function App() {
  const [showFrequency, setShowFrequency] = useState(false); // State to toggle between grid and frequency view
  const [showNumbersFreq, setShowNumbersFreq] = useState(false) // State to toggle between showing frequency numbers on boxes
  const [scoreFrequencies, setScoreFrequencies] = useState([]) // Used to store score frequency data
  const [allGameData, setAllGameData] = useState([]); // Used to score the metadata around each individual score
  const [existingScores, setExistingScores] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

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

        console.log('Parsed Data:', parsedData);
        console.log('Grouped Data:', parsedData_forAllGameData);

        setExistingScores(parsedData);
        const groupedByScore = groupGameDataByScore(parsedData_forAllGameData);
        setAllGameData(groupedByScore);
        const groupedByFrequency = getFrequencyData(parsedData_forAllGameData);
        setScoreFrequencies(groupedByFrequency);
        setLoading(false);
      } else {
        console.error("No data fetched.");
        setLoading(false);
      }
    };

    fetchData();
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

    <div className="button-group">
      <button className="styled-button" onClick={toggleFrequency}>
        {showFrequency ? "Hide Frequency Gradient" : "Show Frequency Gradient"}
      </button>

      <button className="styled-button" onClick={toggleShowNumbersFreq}>
        {showNumbersFreq ? "Hide Frequency Count" : "Show Frequency Count"}
      </button>
    </div>


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

      <div className="additional-info">
        <AdditionalInfoView/>
      </div>
    </div>

  );
}

export default App;
