// src/components/Grid/PathLine.tsx

import React from 'react';
import { Polyline } from 'react-native-svg';
import { CellPosition } from '../../models/CellPosition';

interface PathLineProps {
  cells: CellPosition[];
  color: string;
  strokeWidth: number;
  getCellCenter: (position: CellPosition) => { x: number; y: number }; // Function to get world coords
}

const PathLine: React.FC<PathLineProps> = ({ cells, color, strokeWidth, getCellCenter }) => {
  if (cells.length < 2) {
    return null; // Cannot draw a line with less than 2 points
  }

  // Convert cell positions to world coordinate points string for Polyline
  const points = cells.map(cell => {
    const center = getCellCenter(cell);
    return `${center.x},${center.y}`;
  }).join(' ');

  return (
    <Polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round" // Make line ends round
      strokeLinejoin="round" // Make line joins round
    />
  );
};

export default PathLine;

