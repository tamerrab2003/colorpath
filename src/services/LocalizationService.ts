import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder resources. Replace with actual translations.
const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "level": "Level",
      "completed": "Completed!",
      "moves": "Moves",
      "restart": "Restart",
      "hint": "Hint",
      "settings": "Settings",
      "pause": "Pause",
      "resume": "Resume",
      "quit": "Quit",
      // Add other keys used in the UI
    }
  },
  // Add other languages here (es, ar, zh) with their translations
  es: {
    translation: {
      "welcome": "Bienvenido",
      "level": "Nivel",
      "completed": "¡Completado!",
      "moves": "Movimientos",
      "restart": "Reiniciar",
      "hint": "Pista",
      "settings": "Ajustes",
      "pause": "Pausa",
      "resume": "Reanudar",
      "quit": "Salir",
    }
  },
  ar: {
    translation: {
      "welcome": "أهلاً بك",
      "level": "المستوى",
      "completed": "اكتمل!",
      "moves": "الحركات",
      "restart": "إعادة",
      "hint": "تلميح",
      "settings": "الإعدادات",
      "pause": "إيقاف مؤقت",
      "resume": "استئناف",
      "quit": "خروج",
    }
  },
  zh: {
    translation: {
      "welcome": "欢迎",
      "level": "等级",
      "completed": "已完成！",
      "moves": "步数",
      "restart": "重新开始",
      "hint": "提示",
      "settings": "设置",
      "pause": "暂停",
      "resume": "继续",
      "quit": "退出",
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    compatibilityJSON: 'v3' // Recommended for Expo/React Native
  });

export default i18n;

