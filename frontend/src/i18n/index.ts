import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import kn from './locales/kn.json';

const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nammaseve_lang');
    if (saved === 'kn' || saved === 'en') return saved;
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('kn')) {
      return 'kn';
    }
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      kn: { translation: kn },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    load: 'languageOnly',
    supportedLngs: ['en', 'kn'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
  });

export function switchLanguage(lang: 'en' | 'kn') {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('nammaseve_lang', lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }
}

export default i18n;
