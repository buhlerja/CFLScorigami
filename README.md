# CFL Scorigami

CFL Scorigami is a project that tracks and visualizes unique final score combinations in Canadian Football League (CFL) games. Inspired by the concept of "scorigami" in American football, this tool identifies which score results have never occurred before in CFL history and highlights new unique outcomes as games are played.

## Background
- Collected historical CFL game scores using a Python web scraper and data from CFL.ca
- Game data is stored in an Excel file and pulled in through an API which makes it easy to update

## Features
- Identifies unique final score combinations
- "Show Frequency Gradient" button provides a heat map based on score frequency
- "Show Frequency Count" button numbers each Scorigami square with the amount of times that particular score has happened
- "Show Scorigami by Year" button allows for a visualization of the progression of CFL Scorigami year-by-year. Drag the slider to see all Scorigami scores from any particular year.