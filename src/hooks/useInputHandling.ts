// src/hooks/useInputHandling.ts

import { useCallback, useRef } from 'react';
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { CellPosition } from '../models/CellPosition';

interface UseInputHandlingProps {
  gridSize: { rows: number; cols: number } | null;
  cellSize: number;
  gridOffset: { x: number; y: number };
  onPathStart: (position: CellPosition) => void;
  onPathUpdate: (position: CellPosition) => void;
  onPathEnd: () => void;
  enabled: boolean;
}

export const useInputHandling = ({
  gridSize,
  cellSize,
  gridOffset,
  onPathStart,
  onPathUpdate,
  onPathEnd,
  enabled = true,
}: UseInputHandlingProps) => {
  // Track if we're currently drawing a path
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef<CellPosition | null>(null);

  // Convert screen coordinates to grid cell position
  const screenToGridPosition = useCallback(
    (screenX: number, screenY: number): CellPosition | null => {
      if (!gridSize) return null;

      // Adjust for grid offset
      const relativeX = screenX - gridOffset.x;
      const relativeY = screenY - gridOffset.y;

      // Calculate grid cell
      const col = Math.floor(relativeX / cellSize);
      const row = Math.floor(relativeY / cellSize);

      // Validate position is within grid bounds
      if (
        row >= 0 &&
        row < gridSize.rows &&
        col >= 0 &&
        col < gridSize.cols
      ) {
        return { row, col };
      }
      return null;
    },
    [gridSize, cellSize, gridOffset]
  );

  // Create pan responder for handling touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: () => enabled,

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        if (!enabled) return;

        // Use pageX/pageY for potentially better cross-platform compatibility
        const { pageX, pageY } = evt.nativeEvent;
        const position = screenToGridPosition(pageX, pageY);

        if (position) {
          isDrawingRef.current = true;
          lastPositionRef.current = position;
          onPathStart(position);
        }
      },

      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!enabled || !isDrawingRef.current) return;

        // Use pageX/pageY for potentially better cross-platform compatibility
        const { pageX, pageY } = evt.nativeEvent;
        const position = screenToGridPosition(pageX, pageY);

        if (position) {
          // Only update if position has changed from last one
          if (
            !lastPositionRef.current ||
            position.row !== lastPositionRef.current.row ||
            position.col !== lastPositionRef.current.col
          ) {
            lastPositionRef.current = position;
            onPathUpdate(position);
          }
        }
      },

      onPanResponderRelease: () => {
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          lastPositionRef.current = null;
          onPathEnd();
        }
      },

      onPanResponderTerminate: () => {
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          lastPositionRef.current = null;
          onPathEnd();
        }
      },
    })
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    screenToGridPosition, // Expose this for potential use elsewhere
  };
};

