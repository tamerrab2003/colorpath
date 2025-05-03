// src/models/LevelData.ts

import { CellPosition } from "./CellPosition";

export interface DotPair {
  id: number;
  color: string; // Hex color string (e.g., "#FF0000")
  start: CellPosition;
  end: CellPosition;
}

export interface GridSize {
  rows: number;
  cols: number;
}

export interface LevelData {
  level: number;
  gridSize: GridSize;
  dots: DotPair[];
  obstacles: CellPosition[];
}

