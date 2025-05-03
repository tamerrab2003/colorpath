// src/hooks/useGameLogic.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Grid } from '../models/Grid';
import { LevelData } from '../models/LevelData';
import { CellPosition } from '../models/CellPosition';
import { Path } from '../models/Path';
import { useGameState } from '../contexts/GameStateContext';
import { LevelService } from '../services/LevelService'; // Import LevelService

export const useGameLogic = () => {
  const { state: gameState, dispatch } = useGameState();
  const [gridInstance, setGridInstance] = useState<Grid | null>(null);
  const [currentDrawingPathId, setCurrentDrawingPathId] = useState<number | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isLoadingLevel, setIsLoadingLevel] = useState(true);

  // Memoize the current level number to avoid unnecessary reloads
  const currentLevelNumber = useMemo(() => gameState?.currentLevel ?? 1, [gameState?.currentLevel]);

  // Load level data and initialize grid when level changes
  useEffect(() => {
    const initializeLevel = async () => {
      if (!gameState) return; // Wait for gameState to be loaded
      
      setIsLoadingLevel(true);
      setIsLevelComplete(false);
      setCurrentDrawingPathId(null);
      setGridInstance(null); // Clear previous grid

      // Use LevelService to load data
      const levelData = await LevelService.loadLevelData(currentLevelNumber);
      if (levelData) {
        setGridInstance(new Grid(levelData));
      } else {
        console.error(`Failed to load data for level ${currentLevelNumber}`);
        // Handle error: show message, go back to level select, etc.
        // Maybe dispatch an action to set an error state?
      }
      setIsLoadingLevel(false);
    };

    initializeLevel();
  }, [currentLevelNumber, gameState]); // Rerun when level number changes

  // --- Path Drawing Logic ---

  const startPath = useCallback((startPosition: CellPosition) => {
    if (!gridInstance || isLevelComplete || isLoadingLevel) return;

    const dotInfo = gridInstance.getDotAt(startPosition);
    if (dotInfo) {
      // Reset the path if starting from a dot
      gridInstance.resetPath(dotInfo.id);
      setCurrentDrawingPathId(dotInfo.id);
      // Force a re-render by creating a new grid instance (or trigger update differently)
      setGridInstance(new Grid(gridInstance)); // Simple way to trigger update
    } else {
      // Check if starting from an existing path segment
      const cell = gridInstance.getCell(startPosition);
      if (cell?.pathId !== null) {
        setCurrentDrawingPathId(cell.pathId);
        // Remove path segments back to this point
        gridInstance.removeCellsFromPathBackTo(cell.pathId, startPosition);
        setGridInstance(new Grid(gridInstance)); // Trigger update
      }
    }
  }, [gridInstance, isLevelComplete, isLoadingLevel]);

  const updatePath = useCallback((position: CellPosition) => {
    if (!gridInstance || currentDrawingPathId === null || isLevelComplete || isLoadingLevel) return;

    const success = gridInstance.addCellToPath(currentDrawingPathId, position);
    if (success) {
      // Check for level completion after adding a cell
      if (gridInstance.isLevelComplete()) {
        setIsLevelComplete(true);
        // Optionally trigger animation/sound
        console.log(`Level ${currentLevelNumber} Complete!`);
        // Dispatch completion after a short delay?
        // setTimeout(() => dispatch({ type: 'COMPLETE_LEVEL', payload: { levelNumber: currentLevelNumber } }), 1000);
      }
      setGridInstance(new Grid(gridInstance)); // Trigger update
    }
  }, [gridInstance, currentDrawingPathId, isLevelComplete, isLoadingLevel, currentLevelNumber, dispatch]);

  const endPath = useCallback(() => {
    if (isLevelComplete && gameState) {
        // Only dispatch completion if the level is actually marked as complete
        dispatch({ type: 'COMPLETE_LEVEL', payload: { levelNumber: currentLevelNumber } });
    }
    setCurrentDrawingPathId(null); // Stop drawing regardless of completion
  }, [isLevelComplete, dispatch, currentLevelNumber, gameState]);

  // --- Other Actions ---

  const restartLevel = useCallback(() => {
    // Re-initialize the current level
    const reInitialize = async () => {
        if (!gameState) return;
        setIsLoadingLevel(true);
        setIsLevelComplete(false);
        setCurrentDrawingPathId(null);
        // Use LevelService
        const levelData = await LevelService.loadLevelData(currentLevelNumber);
        if (levelData) {
            setGridInstance(new Grid(levelData));
        }
        setIsLoadingLevel(false);
    };
    reInitialize();
  }, [gameState, currentLevelNumber]);

  const provideHint = useCallback(() => {
    if (!gridInstance || !gameState || gameState.hintsRemaining <= 0) return;

    // Basic hint logic: Find the first incomplete path and highlight its end dot
    let hintGiven = false;
    for (const dotId of gridInstance.getAllDots().map(d => d.id)) { // Use getAllDots()
        if (!gridInstance.isPathComplete(dotId)) {
            const dotInfo = gridInstance.getDotInfo(dotId);
            if (dotInfo) {
                // Need a way to communicate this hint to the View (e.g., state update)
                console.log(`Hint: Try connecting path ${dotId} to ${JSON.stringify(dotInfo.endPosition)}`);
                // Example: setHintTarget(dotInfo.endPosition);
                dispatch({ type: 'USE_HINT' });
                hintGiven = true;
                break;
            }
        }
    }
    if (!hintGiven) {
        console.log("No hints available (all paths complete or error).");
    }
  }, [gridInstance, gameState, dispatch]);

  return {
    gridInstance,
    isLoadingLevel,
    isLevelComplete,
    currentDrawingPathId,
    startPath,
    updatePath,
    endPath,
    restartLevel,
    provideHint,
  };
};

