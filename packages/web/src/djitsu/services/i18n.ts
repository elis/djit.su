import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translations from 'djitsu/texts'

i18n.use(initReactI18next).init({
  resources: translations,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})
