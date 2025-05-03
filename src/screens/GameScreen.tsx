// src/screens/GameScreen.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg from 'react-native-svg';
import { useGameLogic } from '../hooks/useGameLogic';
import { useInputHandling } from '../hooks/useInputHandling';
import GridBackground from '../components/Grid/GridBackground';
import Dot from '../components/Grid/Dot';
import PathLine from '../components/Grid/PathLine';
import Obstacle from '../components/Grid/Obstacle';
import GameScreenUI from '../components/GameScreenUI';
import { CellPosition } from '../models/CellPosition';

// Constants for grid rendering
const PADDING = 20;

const GameScreen = () => {
  const {
    gridInstance,
    isLoadingLevel,
    isLevelComplete,
    currentDrawingPathId,
    startPath,
    updatePath,
    endPath,
    restartLevel,
    provideHint,
  } = useGameLogic();

  const [isPaused, setIsPaused] = useState(false);
  const [viewLayout, setViewLayout] = useState({ width: 0, height: 0 });

  // Calculate grid dimensions and cell size based on screen size
  const gridRenderConfig = useMemo(() => {
    if (!gridInstance || viewLayout.width === 0 || viewLayout.height === 0) {
      return null;
    }

    const availableWidth = viewLayout.width - PADDING * 2;
    const availableHeight = viewLayout.height - PADDING * 2; // Adjust for UI elements if needed

    const cellWidth = availableWidth / gridInstance.cols;
    const cellHeight = availableHeight / gridInstance.rows;
    const cellSize = Math.min(cellWidth, cellHeight);

    const gridWidth = cellSize * gridInstance.cols;
    const gridHeight = cellSize * gridInstance.rows;

    // Center the grid
    const offsetX = (viewLayout.width - gridWidth) / 2;
    const offsetY = (viewLayout.height - gridHeight) / 2;

    const dotRadius = cellSize * 0.2; // Example: 20% of cell size
    const pathStrokeWidth = cellSize * 0.15; // Example: 15% of cell size

    return {
      cellSize,
      gridWidth,
      gridHeight,
      gridOffset: { x: offsetX, y: offsetY },
      dotRadius,
      pathStrokeWidth,
    };
  }, [gridInstance, viewLayout]);

  // Input handling hook
  const { panHandlers } = useInputHandling({
    gridSize: gridInstance ? { rows: gridInstance.rows, cols: gridInstance.cols } : null,
    cellSize: gridRenderConfig?.cellSize ?? 0,
    gridOffset: gridRenderConfig?.gridOffset ?? { x: 0, y: 0 },
    onPathStart: startPath,
    onPathUpdate: updatePath,
    onPathEnd: endPath,
    enabled: !isLoadingLevel && !isLevelComplete && !isPaused,
  });

  // Helper function for rendering components
  const getCellCenter = useCallback((position: CellPosition): { x: number; y: number } => {
    if (!gridRenderConfig) return { x: 0, y: 0 };
    return {
      x: gridRenderConfig.gridOffset.x + (position.col + 0.5) * gridRenderConfig.cellSize,
      y: gridRenderConfig.gridOffset.y + (position.row + 0.5) * gridRenderConfig.cellSize,
    };
  }, [gridRenderConfig]);

  const getCellTopLeft = useCallback((position: CellPosition): { x: number; y: number } => {
    if (!gridRenderConfig) return { x: 0, y: 0 };
    return {
      x: gridRenderConfig.gridOffset.x + position.col * gridRenderConfig.cellSize,
      y: gridRenderConfig.gridOffset.y + position.row * gridRenderConfig.cellSize,
    };
  }, [gridRenderConfig]);

  // UI Action Handlers
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);
  const handleSettings = () => {
    // Pause game when opening settings
    setIsPaused(true);
    // Logic to show settings modal is handled within GameScreenUI
  };
  const handleNextLevel = () => {
    // The endPath callback in useGameLogic already dispatches COMPLETE_LEVEL
    // which triggers a level change. No extra action needed here unless
    // we want to hide the modal immediately.
    console.log("Next Level Pressed");
  };

  // Store layout dimensions
  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setViewLayout({ width, height });
  };

  // Render grid elements
  const renderGridContent = () => {
    if (!gridInstance || !gridRenderConfig || isLoadingLevel) {
      // Optionally return a loading indicator
      return null;
    }

    const elements = [];
    const drawnPaths = gridInstance.getAllPaths();

    // 1. Draw completed paths first (underneath dots)
    drawnPaths.forEach(path => {
      if (path.cells.length >= 2) {
        elements.push(
          <PathLine
            key={`path-${path.dotId}`}
            cells={path.cells}
            color={path.colorHex}
            strokeWidth={gridRenderConfig.pathStrokeWidth}
            getCellCenter={getCellCenter}
          />
        );
      }
    });

    // 2. Draw obstacles
    for (let r = 0; r < gridInstance.rows; r++) {
      for (let c = 0; c < gridInstance.cols; c++) {
        const cell = gridInstance.getCell({ row: r, col: c });
        if (cell?.isObstacle) {
          elements.push(
            <Obstacle
              key={`obs-${r}-${c}`}
              position={cell.position}
              size={gridRenderConfig.cellSize}
              topLeft={getCellTopLeft(cell.position)}
            />
          );
        }
      }
    }

    // 3. Draw dots (on top of paths and obstacles)
    for (const dotInfo of gridInstance.getAllDots()) { // Assumes getAllDots() exists in Grid model
        elements.push(
            <Dot
                key={`dot-start-${dotInfo.id}`}
                position={dotInfo.startPosition}
                color={dotInfo.colorHex}
                radius={gridRenderConfig.dotRadius}
                centerOffset={getCellCenter(dotInfo.startPosition)}
            />
        );
        elements.push(
            <Dot
                key={`dot-end-${dotInfo.id}`}
                position={dotInfo.endPosition}
                color={dotInfo.colorHex}
                radius={gridRenderConfig.dotRadius}
                centerOffset={getCellCenter(dotInfo.endPosition)}
            />
        );
    }

    return elements;
  };

  // Add getAllDots() to Grid.ts model if it doesn't exist:
  /*
  // In src/models/Grid.ts
  getAllDots(): DotInfo[] {
    return Array.from(this.dots.values());
  }
  */

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Svg
        width={viewLayout.width}
        height={viewLayout.height}
        style={styles.svgContainer}
        {...panHandlers} // Attach pan handlers to the SVG surface
      >
        {gridRenderConfig && (
          <GridBackground
            rows={gridInstance?.rows ?? 0}
            cols={gridInstance?.cols ?? 0}
            cellSize={gridRenderConfig.cellSize}
            width={gridRenderConfig.gridWidth}
            height={gridRenderConfig.gridHeight}
            gridOffset={gridRenderConfig.gridOffset}
          />
        )}
        {renderGridContent()}
      </Svg>

      {/* UI Overlay */} 
      <GameScreenUI
        onHintPress={provideHint}
        onRestartPress={restartLevel}
        onSettingsPress={handleSettings}
        onPausePress={handlePause}
        onResumePress={handleResume}
        onNextLevelPress={handleNextLevel}
        isLevelComplete={isLevelComplete}
        isPaused={isPaused}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', // Or use dark mode color
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    // backgroundColor: 'lightblue', // For debugging layout
  },
});

export default GameScreen;

