// src/models/GameState.ts

export interface GameSettings {
  soundEnabled: boolean;
  language: string; // e.g., "en", "es", "ar", "zh"
}

export interface GameState {
  currentLevel: number;
  highestLevelUnlocked: number;
  hintsRemaining: number;
  // Potentially store completed paths or other level-specific progress if needed
  // completedPaths?: { [level: number]: { [dotId: number]: CellPosition[] } };
  settings: GameSettings;
}

// Initial state factory
export const createInitialGameState = (): GameState => ({
  currentLevel: 1,
  highestLevelUnlocked: 1,
  hintsRemaining: 3, // Starting hints
  settings: {
    soundEnabled: true,
    language: "en", // Default language
  },
});

