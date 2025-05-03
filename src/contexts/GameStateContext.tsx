// src/contexts/GameStateContext.tsx

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { GameState, GameSettings, createInitialGameState } from '../models/GameState';
import { usePersistence } from '../hooks/usePersistence';
import { SettingsProvider } from './SettingsContext'; // Import SettingsProvider

// --- State and Actions ---

interface GameStateContextProps {
  state: GameState | null;
  isLoading: boolean;
  dispatch: React.Dispatch<Action>;
  // Convenience functions can be added here if needed, e.g.:
  // completeLevel: (levelNumber: number) => void;
  // useHint: () => void;
}

type Action = 
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'COMPLETE_LEVEL'; payload: { levelNumber: number } }
  | { type: 'USE_HINT' }
  | { type: 'ADD_HINT' }
  | { type: 'UPDATE_SETTINGS'; payload: GameSettings }
  | { type: 'RESET_GAME' };

const GameStateContext = createContext<GameStateContextProps | undefined>(undefined);

// --- Reducer Logic ---

const gameStateReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'COMPLETE_LEVEL':
      // Ensure we don't go backward and unlock next level
      const nextLevel = action.payload.levelNumber + 1;
      const highestUnlocked = Math.max(state.highestLevelUnlocked, nextLevel);
      return {
        ...state,
        currentLevel: nextLevel, // Move to the next level
        highestLevelUnlocked: highestUnlocked,
        // Optionally add a hint for completing a level?
      };
    case 'USE_HINT':
      if (state.hintsRemaining > 0) {
        return { ...state, hintsRemaining: state.hintsRemaining - 1 };
      }
      return state; // No change if no hints left
    case 'ADD_HINT':
        return { ...state, hintsRemaining: state.hintsRemaining + 1 };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'RESET_GAME':
      return createInitialGameState(); // Reset to initial defaults
    default:
      return state;
  }
};

// --- Provider Component ---

interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  const { gameState: persistedState, isLoading: isPersistenceLoading, saveState, resetState: resetPersistence } = usePersistence();
  const [state, dispatch] = useReducer(gameStateReducer, null); // Start with null until loaded

  // Load initial state from persistence
  useEffect(() => {
    if (persistedState) {
      dispatch({ type: 'SET_STATE', payload: persistedState });
    }
  }, [persistedState]);

  // Save state whenever it changes (and isn't loading)
  useEffect(() => {
    if (state && !isPersistenceLoading) {
      saveState(state);
    }
  }, [state, saveState, isPersistenceLoading]);

  // Callback for SettingsProvider to update the main GameState
  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  }, []);

  // Combine loading states
  const isLoading = isPersistenceLoading || state === null;

  // Handle reset action
  const enhancedDispatch = useCallback((action: Action) => {
    if (action.type === 'RESET_GAME') {
      resetPersistence(); // Reset persisted state as well
    } else {
      dispatch(action);
    }
  }, [resetPersistence]);

  if (isLoading) {
    // Optionally return a loading indicator component
    return null; 
  }

  return (
    <GameStateContext.Provider value={{ state, isLoading, dispatch: enhancedDispatch }}>
      {/* Wrap children with SettingsProvider, passing initial settings and callback */}
      <SettingsProvider initialSettings={state.settings} onSettingsChange={handleSettingsChange}>
        {children}
      </SettingsProvider>
    </GameStateContext.Provider>
  );
};

// --- Hook to use the context ---

export const useGameState = (): GameStateContextProps => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

