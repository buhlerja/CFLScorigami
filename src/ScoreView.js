import React from "react";
import "./ScoreView.css"; 

export default function ScoreView({ scoreKey, data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Score: {scoreKey}</h2>
        {data?.length > 0 ? (
          <ul>
            {data.map(([winTeam, loseTeam, homeTeam, date, week, year], i) => (
              <li key={i}>
                <strong>{date}, {year} </strong>: {winTeam} beat {loseTeam} — {week}. Home: {homeTeam}
              </li>
            ))}
          </ul>
        ) : (
          <p>No game data available for this score.</p>
        )}
      </div>
    </div>
  );
}
