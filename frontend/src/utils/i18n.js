// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../translation/en/translation.json';
import translationES from '../translation/es/translation.json';

const idiomaGuardado = localStorage.getItem('idioma') || 'es'; // Valor por defecto: español

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    es: { translation: translationES },
  },
  lng: idiomaGuardado,
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
