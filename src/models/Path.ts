// src/models/Path.ts

import { CellPosition } from "./CellPosition";

export class Path {
  readonly dotId: number;
  readonly colorHex: string;
  cells: CellPosition[];

  constructor(dotId: number, colorHex: string, startPosition: CellPosition) {
    this.dotId = dotId;
    this.colorHex = colorHex;
    this.cells = [startPosition];
  }

  addCell(position: CellPosition): void {
    // Optional: Add validation to prevent adding duplicates or non-adjacent cells if needed here
    this.cells.push(position);
  }

  get length(): number {
    return this.cells.length;
  }

  get startPosition(): CellPosition {
    return this.cells[0];
  }

  get endPosition(): CellPosition {
    return this.cells[this.cells.length - 1];
  }

  // Check if a position is already part of this path
  contains(position: CellPosition): boolean {
    return this.cells.some(cell => cell.row === position.row && cell.col === position.col);
  }
}

