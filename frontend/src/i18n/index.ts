import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import kn from './locales/kn.json';

const savedLanguage = (typeof window !== 'undefined' && localStorage.getItem('nammaseve_lang')) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      kn: { translation: kn },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes XSS
    },
  });

export function switchLanguage(lang: 'en' | 'kn') {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('nammaseve_lang', lang);
  }
}

export default i18n;
