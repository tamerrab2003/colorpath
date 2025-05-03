// src/models/Grid.ts

import { CellPosition } from "./CellPosition";
import { LevelData, DotPair } from "./LevelData";
import { Path } from "./Path";

// Represents the state of a single cell on the grid
interface CellState {
  position: CellPosition;
  isObstacle: boolean;
  dotId: number | null; // ID of the dot occupying this cell (if any)
  pathId: number | null; // ID of the path occupying this cell (if any)
}

// Represents information about a dot placed on the grid
interface DotInfo {
  id: number;
  colorHex: string;
  startPosition: CellPosition;
  endPosition: CellPosition;
}

export class Grid {
  readonly rows: number;
  readonly cols: number;
  private cells: CellState[][];
  private dots: Map<number, DotInfo>; // Map dotId to DotInfo
  private paths: Map<number, Path>; // Map dotId to the Path object

  constructor(levelData: LevelData) {
    this.rows = levelData.gridSize.rows;
    this.cols = levelData.gridSize.cols;
    this.cells = [];
    this.dots = new Map();
    this.paths = new Map();

    this.initializeGrid(levelData);
  }

  private initializeGrid(levelData: LevelData): void {
    // 1. Initialize empty cells
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c] = {
          position: { row: r, col: c },
          isObstacle: false,
          dotId: null,
          pathId: null,
        };
      }
    }

    // 2. Place obstacles
    levelData.obstacles.forEach(pos => {
      if (this.isValidPosition(pos)) {
        this.cells[pos.row][pos.col].isObstacle = true;
      }
    });

    // 3. Place dots and initialize paths
    levelData.dots.forEach(dotPair => {
      if (this.isValidPosition(dotPair.start) && this.isValidPosition(dotPair.end)) {
        const dotInfo: DotInfo = {
          id: dotPair.id,
          colorHex: dotPair.color,
          startPosition: dotPair.start,
          endPosition: dotPair.end,
        };
        this.dots.set(dotPair.id, dotInfo);

        // Mark cells as containing dots
        this.cells[dotPair.start.row][dotPair.start.col].dotId = dotPair.id;
        this.cells[dotPair.end.row][dotPair.end.col].dotId = dotPair.id;

        // Initialize path starting at the start dot
        const initialPath = new Path(dotPair.id, dotPair.color, dotPair.start);
        this.paths.set(dotPair.id, initialPath);
        this.cells[dotPair.start.row][dotPair.start.col].pathId = dotPair.id;
      }
    });
  }

  // --- Getters ---

  getCell(position: CellPosition): CellState | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    return this.cells[position.row][position.col];
  }

  getDotInfo(dotId: number): DotInfo | undefined {
    return this.dots.get(dotId);
  }

  getDotAt(position: CellPosition): DotInfo | null {
    const cell = this.getCell(position);
    if (cell?.dotId !== null) {
      return this.dots.get(cell.dotId) || null;
    }
    return null;
  }

  getPath(dotId: number): Path | undefined {
    return this.paths.get(dotId);
  }

  getAllPaths(): Path[] {
    return Array.from(this.paths.values());
  }

  // Added missing method
  getAllDots(): DotInfo[] {
    return Array.from(this.dots.values());
  }

  // --- Path Manipulation ---

  // Attempts to add a cell to a path, returns true if successful
  addCellToPath(dotId: number, position: CellPosition): boolean {
    const path = this.paths.get(dotId);
    if (!path) return false; // Path doesn't exist

    const cell = this.getCell(position);
    if (!cell) return false; // Invalid position

    // Validation checks:
    if (cell.isObstacle) return false; // Cannot path through obstacles
    if (cell.pathId !== null && cell.pathId !== dotId) return false; // Cell occupied by another path
    if (cell.dotId !== null && cell.dotId !== dotId) return false; // Cell occupied by another dot
    if (path.contains(position)) return false; // Path cannot cross itself

    // Check adjacency (simple Manhattan distance check)
    const lastPos = path.endPosition;
    const dist = Math.abs(lastPos.row - position.row) + Math.abs(lastPos.col - position.col);
    if (dist !== 1) return false; // Must be adjacent

    // Add cell to path and update grid state
    path.addCell(position);
    cell.pathId = dotId;
    return true;
  }

  // Removes cells from a path back to a specific position
  removeCellsFromPathBackTo(dotId: number, targetPosition: CellPosition): void {
    const path = this.paths.get(dotId);
    if (!path || path.length <= 1) return; // Cannot remove from empty or single-cell path

    const targetIndex = path.cells.findIndex(p => p.row === targetPosition.row && p.col === targetPosition.col);
    if (targetIndex === -1 || targetIndex === path.length - 1) return; // Target not found or is the last cell

    // Remove cells from grid state and path object
    for (let i = path.length - 1; i > targetIndex; i--) {
      const posToRemove = path.cells[i];
      const cell = this.getCell(posToRemove);
      // Only clear pathId if it's not a dot cell (dots always belong to their path)
      if (cell && cell.dotId !== dotId) {
          cell.pathId = null;
      }
    }
    path.cells.splice(targetIndex + 1);
  }

  // Resets a specific path to just its starting dot
  resetPath(dotId: number): void {
    const path = this.paths.get(dotId);
    const dotInfo = this.dots.get(dotId);
    if (!path || !dotInfo) return;

    // Clear pathId from all cells except the start dot
    for (let i = 1; i < path.cells.length; i++) {
      const cell = this.getCell(path.cells[i]);
      if (cell && cell.dotId !== dotId) { // Don't clear if it's the end dot
        cell.pathId = null;
      }
    }

    // Reset path object
    path.cells = [dotInfo.startPosition];
    // Ensure start cell has correct pathId (should already be set, but good practice)
    const startCell = this.getCell(dotInfo.startPosition);
    if (startCell) startCell.pathId = dotId;
  }

  // --- Validation & Checks ---

  isValidPosition(position: CellPosition): boolean {
    return (
      position.row >= 0 &&
      position.row < this.rows &&
      position.col >= 0 &&
      position.col < this.cols
    );
  }

  isPathComplete(dotId: number): boolean {
    const path = this.paths.get(dotId);
    const dotInfo = this.dots.get(dotId);
    if (!path || !dotInfo) return false;

    // Path is complete if its end position matches the dot's end position
    const lastPos = path.endPosition;
    return lastPos.row === dotInfo.endPosition.row && lastPos.col === dotInfo.endPosition.col;
  }

  areAllPathsComplete(): boolean {
    if (this.dots.size === 0) return true; // No dots, technically complete
    for (const dotId of this.dots.keys()) {
      if (!this.isPathComplete(dotId)) {
        return false;
      }
    }
    return true;
  }

  isGridFull(): boolean {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];
        // If a cell is not an obstacle and doesn't have a pathId, it's not full
        if (!cell.isObstacle && cell.pathId === null) {
          return false;
        }
      }
    }
    return true;
  }

  // Check if the level is successfully completed (all paths complete AND grid is full)
  isLevelComplete(): boolean {
    return this.areAllPathsComplete() && this.isGridFull();
  }
}

