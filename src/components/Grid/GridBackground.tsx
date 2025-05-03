// src/components/Grid/GridBackground.tsx

import React from 'react';
import { Rect, G, Line } from 'react-native-svg';

interface GridBackgroundProps {
  rows: number;
  cols: number;
  cellSize: number;
  width: number;
  height: number;
  gridOffset: { x: number; y: number };
  strokeColor?: string;
  strokeWidth?: number;
}

const GridBackground: React.FC<GridBackgroundProps> = ({
  rows,
  cols,
  cellSize,
  width,
  height,
  gridOffset,
  strokeColor = '#EEE', // Light grey for grid lines
  strokeWidth = 1,
}) => {
  const lines = [];

  // Draw vertical lines
  for (let i = 0; i <= cols; i++) {
    const x = gridOffset.x + i * cellSize;
    lines.push(
      <Line
        key={`v-${i}`}
        x1={x}
        y1={gridOffset.y}
        x2={x}
        y2={gridOffset.y + height}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  // Draw horizontal lines
  for (let i = 0; i <= rows; i++) {
    const y = gridOffset.y + i * cellSize;
    lines.push(
      <Line
        key={`h-${i}`}
        x1={gridOffset.x}
        y1={y}
        x2={gridOffset.x + width}
        y2={y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <G>
      {/* Optional: Background Rect if needed */}
      {/* <Rect x={gridOffset.x} y={gridOffset.y} width={width} height={height} fill="#FFF" /> */}
      {lines}
    </G>
  );
};

export default GridBackground;

