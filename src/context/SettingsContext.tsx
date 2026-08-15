import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { safeStorage } from '../utils/logger';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetData: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'obsidian',
  fontScale: 'medium',
  animationsEnabled: true,
  hideFloatingDock: false,
  autoHideDockWhenTyping: true,
  dockPosition: 'left',
  dockCollapsed: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    return safeStorage.getItem('app_settings', defaultSettings);
  });

  useEffect(() => {
    safeStorage.setItem('app_settings', settings);
    
    // Apply theme to document element for Tailwind dark mode or CSS variables
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Apply font scale
    if (settings.fontScale === 'small') document.documentElement.style.fontSize = '14px';
    else if (settings.fontScale === 'large') document.documentElement.style.fontSize = '18px';
    else document.documentElement.style.fontSize = '16px';
    
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetData = () => {
    if (window.confirm("Are you sure you want to completely reset all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetData }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
