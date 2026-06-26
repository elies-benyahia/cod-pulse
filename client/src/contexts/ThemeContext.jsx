import { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
  { id: 'dark',   label: { fr: 'Sombre',  en: 'Dark'   }, icon: '◑' },
  { id: 'medium', label: { fr: 'Neutre',  en: 'Medium' }, icon: '◐' },
  { id: 'light',  label: { fr: 'Clair',   en: 'Light'  }, icon: '○' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('cod-theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('cod-theme', theme);
  }, [theme]);

  const cycle = () => {
    setTheme(t => {
      const idx = THEMES.findIndex(th => th.id === t);
      return THEMES[(idx + 1) % THEMES.length].id;
    });
  };

  const current = THEMES.find(th => th.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycle, current, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
