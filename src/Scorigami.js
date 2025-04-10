import React, { useState, useEffect } from "react";
import './ScorigamiGrid.css';  // Import your custom CSS file

const dim_x = 88; // To account for starting from zero
const dim_y = 55;
const size = 88;

// existing scores is in the format (winning score, losing score) as (x, y)
export default function ScorigamiGrid({ 
  existing_scores = [], 
  score_frequencies = [], 
  show_frequency = false,
  show_numbers_freq = false
}) {
  useEffect(() => {
    console.log('Existing scores (first 5):', existing_scores.slice(0, 5));
    console.log('Score frequencies (first 5):', score_frequencies.slice(0, 5));
    console.log('Sample frequency check for (10,7):', 
      score_frequencies.find(([x,y]) => x === 10 && y === 7));
  }, [existing_scores, score_frequencies]);

  const isActive = (x, y) => {
    return existing_scores.some(([ex, ey]) => ex === x && ey === y);
  };

  // Frequency getter with validation
  const getFrequency = (x, y) => {
    if (!Array.isArray(score_frequencies)) {
      console.warn('Frequency data not loaded or invalid');
      return 0;
    }
    
    const found = score_frequencies.find(([fx, fy]) => 
      Number(fx) === Number(x) && Number(fy) === Number(y));
    
    if (!found) return 0;
    
    // Ensure frequency is a number
    const freq = Number(found[2]);
    if (isNaN(freq)) {
      console.warn(`Invalid frequency value for ${x}-${y}:`, found[2]);
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
        
        {/* Y-Axis Label */}
        <div style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          fontWeight: "bold",
          marginRight: "8px",
          whiteSpace: "nowrap"
        }}>
          Losing Score
        </div>
  
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
          <div style={{ display: "grid", gridTemplateColumns: `40px repeat(${size}, minmax(10px, 1fr))` }}>
            {/* Grid Header (Top row labels) */}
            <div></div> {/* Empty corner cell */}
            {[...Array(size)].map((_, i) => (
              <div key={`header-${i}`} className="grid-cell">{i}</div>
            ))}

            {/* Grid Body (row by row) */}
            {[...Array(size)].map((_, y) => (
              <React.Fragment key={`row-${y}`}>
                {y <= dim_y && (
                  <div className="grid-cell text-center">{y}</div>
                )}
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
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

