import React from 'react';
import { Newspaper, GraduationCap, Briefcase, CheckSquare, Target, Bot, Sparkles } from 'lucide-react';
import { AppTab } from './Header';

interface MobileBottomNavProps {
  activeTab: AppTab | string;
  setActiveTab: (tab: AppTab) => void;
  onOpenAiAssistant?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiAssistant
}) => {
  const tabs = [
    { id: 'news' as AppTab, label: 'Home', icon: Newspaper },
    { id: 'study' as AppTab, label: 'Study', icon: GraduationCap },
    { id: 'jobs' as AppTab, label: 'Pipeline', icon: Briefcase },
    { id: 'tasks' as AppTab, label: 'Tasks', icon: CheckSquare },
    { id: 'metasuite' as AppTab, label: 'AI Suite', icon: Bot },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-[45] bg-black/80 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-2xl flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 active:scale-95 ${
              isActive
                ? 'text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className={`relative p-1 rounded-full transition-all ${isActive ? 'bg-white/15' : ''}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--accent)]' : 'text-neutral-400'}`} />
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-sm" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* AI Assistant quick trigger button */}
      <button
        onClick={() => {
          if (onOpenAiAssistant) {
            onOpenAiAssistant();
          } else {
            document.getElementById('geminiAssistantBtn')?.click();
          }
        }}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-neutral-400 hover:text-indigo-300 transition-all active:scale-95"
        title="Open AI Assistant"
      >
        <div className="p-1 rounded-full bg-indigo-500/20 text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-medium text-indigo-300">
          Ask AI
        </span>
      </button>
    </nav>
  );
};
