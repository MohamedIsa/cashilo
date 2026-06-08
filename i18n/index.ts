import { Language } from '@/contants/storageKeys';
import { getLanguage } from '@/storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

// Initialize with default language
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  initImmediate: false,
  interpolation: {
    escapeValue: false,
  },
});

// Load saved language asynchronously
getLanguage().then((savedLanguage: Language) => {
  i18n.changeLanguage(savedLanguage);
});

export default i18n;
