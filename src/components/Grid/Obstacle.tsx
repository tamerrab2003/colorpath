// src/components/Grid/Obstacle.tsx

import React from 'react';
import { Rect } from 'react-native-svg';
import { CellPosition } from '../../models/CellPosition';

interface ObstacleProps {
  position: CellPosition;
  size: number; // Assuming square obstacles, size = cellSize
  topLeft: { x: number; y: number }; // World coordinates of the top-left corner of the cell
  color?: string; // Optional color for the obstacle
}

const Obstacle: React.FC<ObstacleProps> = ({ position, size, topLeft, color = '#888' }) => {
  // Simple rectangular obstacle
  return (
    <Rect
      x={topLeft.x}
      y={topLeft.y}
      width={size}
      height={size}
      fill={color}
      // Add stroke or other styling as needed
    />
  );
};

export default Obstacle;

