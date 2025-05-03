// App.tsx (Main Entry Point)

// Initialize localization first
import './src/services/LocalizationService.ts';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameStateProvider } from './src/contexts/GameStateContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  return (
    <SafeAreaProvider> 
      <SettingsProvider>
        <GameStateProvider>
          <GameScreen />
          <StatusBar style="auto" /> 
        </GameStateProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

// Note: No need for StyleSheet here unless adding specific App-level styles

