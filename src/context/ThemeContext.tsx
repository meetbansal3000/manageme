import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('manageme_theme') as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyThemeClasses = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('manageme_theme') as ThemeMode) || theme || 'dark';
    setThemeState(savedTheme);
    applyThemeClasses(savedTheme);

    const handleThemeSync = (e: CustomEvent<{ theme: ThemeMode }>) => {
      if (e.detail?.theme) {
        setThemeState(e.detail.theme);
        applyThemeClasses(e.detail.theme);
      }
    };

    window.addEventListener('manageme:themeChange' as any, handleThemeSync);
    return () => window.removeEventListener('manageme:themeChange' as any, handleThemeSync);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    applyThemeClasses(nextTheme);
    try {
      localStorage.setItem('manageme_theme', nextTheme);
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manageme:themeChange', { detail: { theme: nextTheme } }));
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyThemeClasses(newTheme);
    try {
      localStorage.setItem('manageme_theme', newTheme);
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manageme:themeChange', { detail: { theme: newTheme } }));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if rendered outside ThemeProvider
    const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('manageme_theme') : 'dark') as ThemeMode || 'dark';
    return {
      theme: savedTheme,
      isDark: savedTheme === 'dark',
      toggleTheme: () => {
        const next: ThemeMode = savedTheme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem('manageme_theme', next);
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
          }
          window.dispatchEvent(new CustomEvent('manageme:themeChange', { detail: { theme: next } }));
        }
      },
      setTheme: (mode: ThemeMode) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('manageme_theme', mode);
          if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
          }
          window.dispatchEvent(new CustomEvent('manageme:themeChange', { detail: { theme: mode } }));
        }
      }
    };
  }
  return context;
};

export default ThemeContext;
