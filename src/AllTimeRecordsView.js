import React from 'react';
import "./AllTimeRecordsView.css";

// Map city names to full team names
const teamNameMap = {
  "BC": "BC Lions",
  "Calgary": "Calgary Stampeders",
  "Edmonton": "Edmonton Elks / Eskimos",
  "Hamilton": "Hamilton Tiger-Cats",
  "Montreal": "Montreal Alouettes / Concordes",
  "Ottawa": "Ottawa Redblacks / Renegades / Rough Riders",
  "Saskatchewan": "Saskatchewan Roughriders",
  "Toronto": "Toronto Argonauts",
  "Winnipeg": "Winnipeg Blue Bombers",
};

function AllTimeRecordsView({ all_time_records }) {

    if (!all_time_records) {
        return <div>Loading records...</div>; 
    }

    const cityNames = Object.keys(teamNameMap);

    // Compute win % for each team, default 0 if no games
    const teamStats = cityNames.map(city => {
        const [wins, losses, ties] = all_time_records[city] || [0,0,0];
        const total = wins + losses + ties;
        const winPct = total > 0 ? (wins + 0.5 * ties) / total : 0;
        return { city, wins, losses, ties, winPct };
    });

    // Sort descending by winPct
    teamStats.sort((a, b) => b.winPct - a.winPct);

    return (
        <div className="records-container">
        <h1 className="records-title">All-Time CFL Records Ranked by Win %</h1>
        <ul className="records-list">
            {teamStats.map(({ city, wins, losses, ties, winPct }, index) => {
            const teamName = teamNameMap[city];
            const displayWinPct = (winPct * 100).toFixed(2);
            const rank = index + 1;

            return (
                <li className="records-item" key={city}>
                <div className="rank">#{rank}</div>
                <strong>{teamName}</strong>
                <div className="record-stats">
                    <div><span className="label">Wins:</span> {wins}</div>
                    <div><span className="label">Losses:</span> {losses}</div>
                    <div><span className="label">Ties:</span> {ties}</div>
                    <div><span className="label">Win %:</span> {displayWinPct}%</div>
                </div>
                </li>
            );
            })}
        </ul>
        </div>
    );
}

export default AllTimeRecordsView;