import { getLanguage } from '@/utils/storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

// Initialize with default language
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: 'en', // Default to English initially
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Load saved language asynchronously
getLanguage().then((savedLanguage) => {
  i18n.changeLanguage(savedLanguage);
});

export default i18n;