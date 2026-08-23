// Component: Workspace Preferences & Settings Modal

import React from 'react';
import { Sliders, Sun, Moon, Sparkles, Layout, RotateCcw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { ModalWrapper } from './ModalWrapper';
import { Button } from '../ui/Button';

export interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateSettings, resetData } = useSettings();

  const themes = [
    { id: 'obsidian', label: 'Obsidian Night', icon: Moon },
    { id: 'neon', label: 'Cyber Matrix', icon: Sparkles },
    { id: 'light', label: 'Alpine Frost', icon: Sun },
  ];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace Preferences"
      subtitle="Customize your theme, typography, and interface layout"
      icon={<Sliders className="w-5 h-5" />}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Theme Selector */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2.5">
            Interface Theme
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {themes.map((t) => {
              const Icon = t.icon;
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id })}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0052FF]/20 border-[#0052FF] text-white shadow-lg shadow-[#0052FF]/20'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[#0052FF]' : ''}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Scale */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2.5">
            Font Scaling
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['small', 'medium', 'large'] as const).map((scale) => {
              const isSelected = settings.fontScale === scale;
              return (
                <button
                  key={scale}
                  onClick={() => updateSettings({ fontScale: scale })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {scale}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dock Controls */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2.5">
            Shortcut Dock Placement
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['left', 'center', 'right'] as const).map((pos) => {
              const isSelected = settings.dockPosition === pos;
              return (
                <button
                  key={pos}
                  onClick={() => updateSettings({ dockPosition: pos })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0052FF]/20 border-[#0052FF] text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>{pos}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Reset Local Workspace</h4>
            <p className="text-[11px] text-slate-400">Clear cached data and restore default presets</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={resetData}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Workspace
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default PreferencesModal;
