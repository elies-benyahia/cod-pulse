import { createContext, useContext, useState } from 'react';
import fr from '../i18n/fr';
import en from '../i18n/en';

const LANGS = { fr, en };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('cod-lang') || 'fr'
  );

  const t = (key) => LANGS[lang]?.[key] ?? LANGS.fr?.[key] ?? key;

  const toggle = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    localStorage.setItem('cod-lang', next);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
