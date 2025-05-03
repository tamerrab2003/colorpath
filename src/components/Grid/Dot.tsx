// src/components/Grid/Dot.tsx

import React from 'react';
import { Circle } from 'react-native-svg';
import { CellPosition } from '../../models/CellPosition';

interface DotProps {
  position: CellPosition;
  color: string;
  radius: number;
  centerOffset: { x: number; y: number }; // World coordinates of the center of the cell
  // Add optional props for highlighting, animation, etc.
}

const Dot: React.FC<DotProps> = ({ position, color, radius, centerOffset }) => {
  return (
    <Circle
      cx={centerOffset.x}
      cy={centerOffset.y}
      r={radius}
      fill={color}
      // Add onPress or other interaction handlers if dots are directly interactive
    />
  );
};

export default Dot;

