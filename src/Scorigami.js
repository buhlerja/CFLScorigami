import React, { useState, useEffect } from "react";
import ScoreView from "./ScoreView";
import './ScorigamiGrid.css';  

const dim_x = 88; // To account for starting from zero
const dim_y = 55;
const size = 88;

// existing scores is in the format (winning score, losing score) as (x, y)
export default function ScorigamiGrid({ 
  existing_scores = [], 
  score_frequencies = [], 
  show_frequency = false,
  show_numbers_freq = false,
  all_game_data = []
}) {
  /*useEffect(() => {
    console.log('Existing scores (first 5):', existing_scores.slice(0, 5));
    console.log('Grouped GAME DATA', all_game_data["30-20"]);
    console.log('Score frequencies (sample):', Object.entries(score_frequencies).slice(0, 5));
    console.log('Sample frequency check for (10,7):', score_frequencies["10-7"]);
  }, [existing_scores, score_frequencies, all_game_data]);*/
  
  // VARIABLE DECLARATIONS
  const [selectedScore, setSelectedScore] = useState(null);

  const handleClick = (scoreKey) => {
    setSelectedScore(scoreKey); // like "30-20"
  };

  const isActive = (x, y) => {
    return existing_scores.some(([ex, ey]) => Number(ex) === Number(x) && Number(ey) === Number(y));
  };  

  // Frequency getter with validation
  // Frequency getter for dictionary-based score_frequencies
  const getFrequency = (x, y) => {
    if (typeof score_frequencies !== 'object' || score_frequencies === null) {
      console.warn('Frequency data not loaded or invalid');
      return 0;
    }

    const key = `${x}-${y}`;
    const freq = score_frequencies[key];

    if (typeof freq !== 'number') {
      console.warn(`Invalid or missing frequency value for ${key}:`, freq);
      return 0;
    }

    return freq;
  };


  // Enhanced color scaling
  const getFrequencyColor = (frequency) => {
    const clamped = Math.min(Math.max(Number(frequency) || 0, 0), 20);
    const red = 255;
    const green = Math.floor(255 - clamped * 12);
    const blue = Math.floor(255 - clamped * 12);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  return (
    <div className="grid-container">
      {/* Wrap everything in a horizontal flex container */}
      <div style={{ display: "flex", alignItems: "center" }}>
        
  
        {/* Grid with X-axis Label and grid itself */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* X-Axis Label */}
          <div style={{
            textAlign: "center",
            marginBottom: "4px",
            fontWeight: "bold"
          }}>
            Winning Score
          </div>
  
          {/* Header and body as stacked grids with shared columns */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, minmax(10px, 1fr)) 40px` }}>
            {/* Grid Header (Top row labels) */}
            {[...Array(size)].map((_, i) => (
              <div key={`header-${i}`} className="grid-cell">{i}</div>
            ))}
            <div></div>

            {/* Grid Body (row by row) */}
            {[...Array(size)].map((_, y) => (
              <React.Fragment key={`row-${y}`}>
                {[...Array(size)].map((_, x) => {
                  if (x >= y && y <= dim_y){
                    // Render the cell if X >= Y
                    if (!show_frequency) {
                      // Show the o.g. scorigami grid
                      return (
                        <div
                          key={`cell-${x}-${y}`}
                          className={`grid-item ${isActive(x, y) ? "active" : ""}`}
                          title={`Score: (${x}, ${y})`}
                          onClick={() => handleClick(`${x}-${y}`)}
                        >
                          {show_numbers_freq && (
                            <div className="grid-cell text-center">{getFrequency(x, y)}</div>
                          )}
                        </div>
                      );                      
                    } else {
                      // Show the frequency
                      const frequency = getFrequency(x, y);
                      const bgColor = getFrequencyColor(frequency);
                      return (
                        <div
                          key={`cell-${x}-${y}`}
                          className="grid-item"
                          style={{ backgroundColor: bgColor }}
                          title={`Score: (${x}, ${y})`}
                          onClick={() => handleClick(`${x}-${y}`)}
                        >
                          {show_numbers_freq && (
                            <div className="grid-cell text-center">{getFrequency(x, y)}</div>
                          )}
                        </div>
                      );
                    }
              
                  } else {
                    // Hide the cell if X < Y
                    return (
                      <div key={`cell-${x}-${y}`} className="grid-item hidden"></div>
                    );
                  }
                  
                })}
                {/* Y-Axis Row Label on the right side */}
                {y <= dim_y ? (
                  <div className="grid-cell text-center">{y}</div>
                ) : (
                  <div></div>
                )}
              </React.Fragment>
            ))}
            
            {/* Conditionally render the ScoreView modal */}
            {selectedScore && (
              <ScoreView
                scoreKey={selectedScore}
                data={all_game_data[selectedScore]} // Make sure your data is structured like this
                onClose={() => setSelectedScore(null)}
              />
            )}
          </div>
        </div>
        {/* Y-Axis Label */}
        <div style={{
          writingMode: "vertical-rl",
          textAlign: "center",
          transform: "rotate(0deg)",
          fontWeight: "bold",
          marginRight: "8px",
          whiteSpace: "nowrap",
          marginTop: "calc(-25%)",   // <-- push it up!
        }}>
          Losing Score
        </div>
      </div>
    </div>
  );
}

