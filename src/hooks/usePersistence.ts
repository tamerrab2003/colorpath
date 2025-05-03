// src/hooks/usePersistence.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, createInitialGameState } from '../models/GameState';

const GAME_STATE_KEY = '@ColorPath:gameState';

export const usePersistence = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from AsyncStorage on initial mount
  useEffect(() => {
    const loadState = async () => {
      setIsLoading(true);
      try {
        const savedStateString = await AsyncStorage.getItem(GAME_STATE_KEY);
        if (savedStateString) {
          const savedState = JSON.parse(savedStateString) as GameState;
          // Basic validation/migration could happen here if needed
          setGameState(savedState);
        } else {
          // No saved state, use initial state
          setGameState(createInitialGameState());
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        // Fallback to initial state on error
        setGameState(createInitialGameState());
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Save state whenever it changes
  const saveState = useCallback(async (newState: GameState) => {
    try {
      const stateString = JSON.stringify(newState);
      await AsyncStorage.setItem(GAME_STATE_KEY, stateString);
      // Update local state after successful save
      setGameState(newState);
    } catch (error) {
      console.error('Failed to save game state:', error);
      // Optionally handle save errors (e.g., notify user)
    }
  }, []);

  // Function to reset state to initial values
  const resetState = useCallback(async () => {
    const initialState = createInitialGameState();
    await saveState(initialState);
  }, [saveState]);

  return {
    gameState,
    isLoading,
    saveState,
    resetState,
  };
};

