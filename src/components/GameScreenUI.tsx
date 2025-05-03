// src/components/GameScreenUI.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from './UI/Button';
import Modal from './UI/Modal';
import { useGameState } from '../contexts/GameStateContext';
import { useSettings } from '../contexts/SettingsContext';
import { AdMobService } from '../services/AdMobService';

interface GameScreenUIProps {
  onHintPress: () => void;
  onRestartPress: () => void;
  onSettingsPress: () => void;
  onPausePress: () => void;
  onResumePress: () => void;
  onNextLevelPress: () => void;
  isLevelComplete: boolean;
  isPaused: boolean;
}

const GameScreenUI: React.FC<GameScreenUIProps> = ({
  onHintPress,
  onRestartPress,
  onSettingsPress,
  onPausePress,
  onResumePress,
  onNextLevelPress,
  isLevelComplete,
  isPaused,
}) => {
  const { t } = useTranslation();
  const { state } = useGameState();
  const { settings, updateSoundSetting, updateLanguageSetting } = useSettings();
  
  const [showSettings, setShowSettings] = React.useState(false);

  // Handle settings modal
  const handleSettingsPress = () => {
    setShowSettings(true);
    onSettingsPress();
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Handle hint with ad
  const handleHintPress = () => {
    if (state && state.hintsRemaining > 0) {
      // Use a hint directly
      onHintPress();
    } else {
      // Show rewarded ad for hint
      AdMobService.showRewardedAd(() => {
        // This callback is called when the reward is earned
        onHintPress();
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.levelText}>
          {t('ui_level')}: {state?.currentLevel || 1}
        </Text>
        <View style={styles.topBarButtons}>
          <Button
            title={t('ui_hint')}
            onPress={handleHintPress}
            style={styles.smallButton}
            textStyle={styles.smallButtonText}
          />
          <Text style={styles.hintCount}>{state?.hintsRemaining || 0}</Text>
          <Button
            title={t('ui_restart')}
            onPress={onRestartPress}
            style={styles.smallButton}
            textStyle={styles.smallButtonText}
          />
          <Button
            title={t('ui_settings')}
            onPress={handleSettingsPress}
            style={styles.smallButton}
            textStyle={styles.smallButtonText}
          />
          <Button
            title={isPaused ? t('ui_resume') : t('ui_pause')}
            onPress={isPaused ? onResumePress : onPausePress}
            style={styles.smallButton}
            textStyle={styles.smallButtonText}
          />
        </View>
      </View>

      {/* Level Complete Modal */}
      <Modal
        visible={isLevelComplete}
        title={t('ui_level_complete')}
        onClose={() => {}} // No close option, must press Next Level
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            {t('ui_level')}: {state?.currentLevel || 1}
          </Text>
          <Button
            title={t('ui_next_level')}
            onPress={onNextLevelPress}
            style={styles.modalButton}
          />
        </View>
      </Modal>

      {/* Pause Modal */}
      <Modal
        visible={isPaused && !isLevelComplete && !showSettings}
        title={t('ui_paused')}
        onClose={onResumePress}
      >
        <View style={styles.modalContent}>
          <Button
            title={t('ui_resume')}
            onPress={onResumePress}
            style={styles.modalButton}
          />
          <Button
            title={t('ui_restart')}
            onPress={onRestartPress}
            style={styles.modalButton}
          />
          <Button
            title={t('ui_settings')}
            onPress={handleSettingsPress}
            style={styles.modalButton}
          />
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        title={t('ui_settings')}
        onClose={handleCloseSettings}
      >
        <View style={styles.modalContent}>
          {/* Sound Toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('ui_sound')}</Text>
            <Button
              title={settings.soundEnabled ? 'ON' : 'OFF'}
              onPress={() => updateSoundSetting(!settings.soundEnabled)}
              style={[
                styles.toggleButton,
                settings.soundEnabled ? styles.toggleOn : styles.toggleOff,
              ]}
            />
          </View>

          {/* Language Selection */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('ui_language')}</Text>
            <View style={styles.languageButtons}>
              <Button
                title="EN"
                onPress={() => updateLanguageSetting('en')}
                style={[
                  styles.langButton,
                  settings.language === 'en' && styles.selectedLang,
                ]}
              />
              <Button
                title="ES"
                onPress={() => updateLanguageSetting('es')}
                style={[
                  styles.langButton,
                  settings.language === 'es' && styles.selectedLang,
                ]}
              />
              <Button
                title="AR"
                onPress={() => updateLanguageSetting('ar')}
                style={[
                  styles.langButton,
                  settings.language === 'ar' && styles.selectedLang,
                ]}
              />
              <Button
                title="ZH"
                onPress={() => updateLanguageSetting('zh')}
                style={[
                  styles.langButton,
                  settings.language === 'zh' && styles.selectedLang,
                ]}
              />
            </View>
          </View>

          <Button
            title="Close"
            onPress={handleCloseSettings}
            style={styles.modalButton}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10, // Ensure UI is above the game grid
    pointerEvents: 'box-none', // Allow touches to pass through to the game grid
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topBarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  smallButtonText: {
    fontSize: 14,
  },
  hintCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    width: '80%',
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  toggleButton: {
    width: 80,
  },
  toggleOn: {
    backgroundColor: '#4CD964', // Green
  },
  toggleOff: {
    backgroundColor: '#FF3B30', // Red
  },
  languageButtons: {
    flexDirection: 'row',
  },
  langButton: {
    width: 40,
    height: 40,
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginHorizontal: 5,
  },
  selectedLang: {
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#000',
  },
});

export default GameScreenUI;
