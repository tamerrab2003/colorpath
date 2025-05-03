// src/services/LevelService.ts

import { LevelData } from "../models/LevelData";

// In a real app, these would be loaded dynamically, e.g., from JSON files
// bundled with the app or fetched from a server.
const levels: { [key: number]: LevelData } = {
  1: {
    level: 1,
    gridSize: { rows: 2, cols: 2 },
    dots: [
      { id: 0, color: "#FF0000", start: { row: 0, col: 0 }, end: { row: 1, col: 1 } },
      { id: 1, color: "#0000FF", start: { row: 1, col: 0 }, end: { row: 0, col: 1 } }
    ],
    obstacles: []
  },
  2: {
    level: 2,
    gridSize: { rows: 3, cols: 3 },
    dots: [
      { id: 0, color: "#FF0000", start: { row: 0, col: 0 }, end: { row: 2, col: 2 } },
      { id: 1, color: "#0000FF", start: { row: 0, col: 2 }, end: { row: 2, col: 0 } },
      { id: 2, color: "#00FF00", start: { row: 1, col: 0 }, end: { row: 1, col: 2 } }
    ],
    obstacles: []
  },
  3: {
    level: 3,
    gridSize: { rows: 3, cols: 3 },
    dots: [
      { id: 0, color: "#FF0000", start: { row: 0, col: 0 }, end: { row: 0, col: 2 } },
      { id: 1, color: "#0000FF", start: { row: 2, col: 0 }, end: { row: 2, col: 2 } }
    ],
    obstacles: [
      { row: 1, col: 1 } // Obstacle in the center
    ]
  }
  // Add more levels here...
};

const loadLevelData = async (levelNumber: number): Promise<LevelData | null> => {
  console.log(`LevelService: Loading level ${levelNumber}`);
  // Simulate async loading if needed
  await new Promise(resolve => setTimeout(resolve, 50)); // Small delay

  if (levels[levelNumber]) {
    return levels[levelNumber];
  } else {
    console.warn(`LevelService: Level ${levelNumber} not found.`);
    return null;
  }
};

export const LevelService = {
  loadLevelData,
};

