// Theme Provider using next-themes with class-based Tailwind and HTML data-theme attribute

'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  rawTheme: string;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const InternalThemeBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme || nextTheme || 'dark') === 'dark';
  const activeTheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', activeTheme);
      document.documentElement.style.colorScheme = activeTheme;
    }
  }, [activeTheme]);

  const toggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setNextTheme(nextMode);
    try {
      localStorage.setItem('manageme_theme', nextMode);
    } catch {}
  };

  const setTheme = (mode: 'light' | 'dark') => {
    setNextTheme(mode);
    try {
      localStorage.setItem('manageme_theme', mode);
    } catch {}
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: activeTheme, 
        rawTheme: nextTheme || 'dark', 
        isDark, 
        toggleTheme, 
        setTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="manageme_theme"
    >
      <InternalThemeBridge>
        {children}
      </InternalThemeBridge>
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('manageme_theme') : 'dark') || 'dark';
    const isDark = savedTheme === 'dark';
    return {
      theme: (isDark ? 'dark' : 'light') as 'light' | 'dark',
      rawTheme: savedTheme,
      isDark,
      toggleTheme: () => {
        const next = isDark ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem('manageme_theme', next);
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            document.documentElement.setAttribute('data-theme', 'light');
          }
        }
      },
      setTheme: (t: 'light' | 'dark') => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('manageme_theme', t);
        }
      }
    };
  }
  return context;
};

export default ThemeProvider;
