import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import es from './locales/es'

// El sistema opera en español (mercado Venezuela). Se mantiene i18next como
// capa de textos para centralizar los literales, pero con un único idioma.
export type TranslationSchema = typeof es

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
  },
  lng: 'es',
  fallbackLng: 'es',
  supportedLngs: ['es'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
