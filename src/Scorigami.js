import React, { useState, useEffect } from "react";
import ScoreView from "./ScoreView";
import './ScorigamiGrid.css';  

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
  
  
  // VARIABLE DECLARATIONS
  const [selectedScore, setSelectedScore] = useState(null);
  const [cellSize, setCellSize] = useState(30); // Initial cell size in pixels
  const [isGridLoaded, setIsGridLoaded] = useState(false);

  // Handle window resize to adjust cell size
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate optimal cell size based on viewport dimensions
      const newCellSize = Math.max(
        15, // Minimum cell size
        Math.min(
          30, // Maximum cell size
          Math.floor(Math.min(viewportWidth * 0.9, viewportHeight * 1.5) / size)
        )
      );
    
      setCellSize(newCellSize);
      setIsGridLoaded(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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

  // Dynamic styles based on cell size
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${size}, ${cellSize}px) ${cellSize * 1.5}px`, // Wider column for y-axis labels
    fontSize: `${Math.max(6, cellSize * 0.35)}px`
  };

  const cellStyle = {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    lineHeight: `${cellSize}px`,
    minWidth: `${cellSize}px` // Ensure cells don't shrink
  };

  if (!isGridLoaded) {
    return <div>Loading...</div>; // Show a loading message or placeholder until grid size is set
  }

  return (
    <div className="grid-container">
      <div style={{ 
        minWidth: 'max-content',
        display: "flex", 
        alignItems: "flex-start", // Changed to flex-start for better label alignment
        justifyContent: "flex-start",
        gap: `${cellSize * 0.5}px`, // Add consistent gap
        padding: `${cellSize * 0.5}px`
      }}>
        
        {/* Grid with X-axis Label and grid itself */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          gap: `${cellSize * 0.3}px` // Consistent gap
        }}>
          
          <div className="axis-label">
            Winning Score
          </div>
  
          {/* Header and body as stacked grids with shared columns */}
          <div style={gridStyle}>
            {/* Grid Header (Top row labels) */}
            {[...Array(size)].map((_, i) => (
              <div 
                key={`header-${i}`} 
                className="grid-cell"
                style={{ ...cellStyle, fontWeight: 'bold' }}
              >
                {i}
              </div>
            ))}
            <div></div>

            {/* Grid Body (row by row) */}
            {[...Array((dim_y + 1))].map((_, y) => (
              <React.Fragment key={`row-${y}`}>
                {[...Array(size)].map((_, x) => {
                  if (x >= y && y <= dim_y){
                    if (!show_frequency) {
                      return (
                        <div
                          key={`cell-${x}-${y}`}
                          className={`grid-item ${isActive(x, y) ? "active" : ""}`}
                          style={cellStyle}
                          title={`Score: (${x}, ${y})`}
                          onClick={() => handleClick(`${x}-${y}`)}
                        >
                          {show_numbers_freq && (
                            <div className="grid-cell text-center">{getFrequency(x, y)}</div>
                          )}
                        </div>
                      );                      
                    } else {
                      const frequency = getFrequency(x, y);
                      const bgColor = getFrequencyColor(frequency);
                      return (
                        <div
                          key={`cell-${x}-${y}`}
                          className="grid-item"
                          style={{ ...cellStyle, backgroundColor: bgColor }}
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
                    return (
                      <div 
                        key={`cell-${x}-${y}`}
                        className="grid-item hidden"
                        style={cellStyle}
                      ></div>
                    );
                  }
                })}
                {/* Y-Axis Row Label on the right side */}
                {y <= dim_y ? (
                  <div 
                    className="grid-cell text-center"
                    style={{ 
                      ...cellStyle, 
                      fontWeight: 'bold',
                      width: `${cellSize * 1.5}px` // Wider column for y-axis
                    }}
                  >
                    {y}
                  </div>
                ) : (
                  <div></div>
                )}
              </React.Fragment>
            ))}
            
            {selectedScore && (
              <ScoreView
                scoreKey={selectedScore}
                data={all_game_data[selectedScore]}
                onClose={() => setSelectedScore(null)}
              />
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="axis-label y-axis-label">
            Losing Score
          </div>
        </div>
      </div>
    </div>
  );
}