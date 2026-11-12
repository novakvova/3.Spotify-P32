import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import uk from './locales/uk'
import en from './locales/en'

export const LANG_STORAGE_KEY = 'lang'

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            uk: { translation: uk },
            en: { translation: en },
        },
        supportedLngs: ['uk', 'en'],
        fallbackLng: 'uk',
        // Читаємо тільки localStorage, щоб мова збігалася з languageSlice,
        // а не з мовою браузера.
        detection: {
            order: ['localStorage'],
            lookupLocalStorage: LANG_STORAGE_KEY,
            caches: [],
        },
        interpolation: { escapeValue: false },
    })

export default i18n
