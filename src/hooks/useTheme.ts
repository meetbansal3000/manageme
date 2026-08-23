import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('manageme_theme') as ThemeMode) || 'dark';
    setThemeState(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }

    const handleThemeEvent = (e: CustomEvent<{ theme: ThemeMode }>) => {
      if (e.detail?.theme) {
        setThemeState(e.detail.theme);
      }
    };

    window.addEventListener('manageme:themeChange' as any, handleThemeEvent);
    return () => window.removeEventListener('manageme:themeChange' as any, handleThemeEvent);
  }, []);

  const applyTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('manageme_theme', newTheme);
    } catch {}

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manageme:themeChange', { detail: { theme: newTheme } }));
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  };

  const setTheme = (newTheme: ThemeMode) => {
    applyTheme(newTheme);
  };

  return { 
    theme, 
    isDark: theme === 'dark', 
    toggleTheme, 
    setTheme 
  };
}

export default useTheme;
