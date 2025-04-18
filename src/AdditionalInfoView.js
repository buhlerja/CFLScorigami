import React from "react";
import "./AdditionalInfoView.css";

export default function AdditionalInfoView() {
  return (
    <div className="additional-info-view">
      <section className="info-section">
        <h2>What is Scorigami?</h2>
        <p>
          Scorigami is a concept thought up by Jon Bois. It is the art of achieving a 
          final score in a game that has never happened before in the history of the sport. 
          Scorigami was initially documented for American football, however this website 
          applies the concept of Scorigami to the Canadian Football League for all games since 
          the inaugual season of 1958. Due to the unique nature of scoring in both Canadian and 
          American football, there are many scoring combinations that have never yet happened. 
          Unlike in American football, in Canadian football each and every scoring combination
          is possible thanks to the single-point Rouge, which leads to a fuller chart with less obvious
          line patterns. See the NFL Scorigami chart for comparison at nflscorigami.com.
        </p>
      </section>

      <section className="info-section">
        <h2>How to Interpret</h2>
        <p>
          Each cell in the Scorigami grid represents a possible final score,
          with the x-axis being the winning team's score and the y-axis being
          the losing team's score. Colored cells indicate scores
          that have occurred before. Empty cells are potential Scorigamis: scores that
          have never occurred in CFL history. Click the button "Show Frequency Count" to 
          see exactly how many times each score has happened. Click "Show Frequency Gradient"
          to get a coloured representation of the scoring distribution. Finally, click on a cell
          to see a history of each game that has ended with the applicable score. 
        </p>
      </section>

      <section className="info-section">
        <h2>Credits</h2>
        <p>
          Inspired by the work of Jon Bois and nflscorigami.com. Credit to CFL.ca for the data.
        </p>
      </section>

      <section className="info-section">
        <h2>Other</h2>
        <p>
          Updates to this website are underway. Last updated: April 18, 2025.
        </p>
      </section>
    </div>
  );
}
