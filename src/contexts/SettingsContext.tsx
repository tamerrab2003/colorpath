// src/contexts/SettingsContext.tsx

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GameSettings } from '../models/GameState';

interface SettingsContextProps {
  settings: GameSettings;
  updateSoundSetting: (enabled: boolean) => void;
  updateLanguageSetting: (language: string) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  initialSettings: GameSettings; // Passed from GameStateContext or persistence
  onSettingsChange: (newSettings: GameSettings) => void; // Callback to notify GameStateContext
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children, initialSettings, onSettingsChange }) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);

  const updateSoundSetting = useCallback((enabled: boolean) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, soundEnabled: enabled };
      onSettingsChange(newSettings); // Notify parent context
      return newSettings;
    });
  }, [onSettingsChange]);

  const updateLanguageSetting = useCallback((language: string) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, language: language };
      onSettingsChange(newSettings); // Notify parent context
      // TODO: Trigger localization service to change language
      // LocalizationService.changeLanguage(language);
      console.log(`SettingsContext: Language changed to ${language} (Placeholder)`);
      return newSettings;
    });
  }, [onSettingsChange]);

  return (
    <SettingsContext.Provider value={{ settings, updateSoundSetting, updateLanguageSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextProps => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

