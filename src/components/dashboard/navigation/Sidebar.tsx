// Component: Dashboard Sidebar Navigation Drawer

import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Briefcase, 
  BookOpen, 
  DollarSign, 
  Brain, 
  Calendar, 
  Award, 
  Compass, 
  Navigation, 
  MessageSquare, 
  FileText, 
  Shield, 
  FileCheck,
  CheckSquare,
  Clock,
  Globe,
  Send,
  X
} from 'lucide-react';
import { TAB_CONFIGS, AppTab } from '../../../data/navigation';
import { cn } from '../../../lib/utils';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const ICON_MAP: Record<string, any> = {
  Sparkles,
  TrendingUp,
  Briefcase,
  BookOpen,
  DollarSign,
  Brain,
  Calendar,
  Award,
  Compass,
  Navigation,
  MessageSquare,
  FileText,
  Shield,
  FileCheck,
  CheckSquare,
  Clock,
  Globe,
  Send
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen = true,
  onClose,
  className
}) => {
  const categories = [
    { id: 'core', label: 'Work & Career' },
    { id: 'intelligence', label: 'Intelligence & AI' },
    { id: 'finance', label: 'Finance & Markets' },
    { id: 'lifestyle', label: 'Lifestyle & Transit' },
    { id: 'legal', label: 'Compliance' },
  ];

  return (
    <aside className={cn(
      'w-64 bg-black/90 backdrop-blur-2xl border-r border-white/10 flex flex-col h-full overflow-hidden text-white',
      className
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#0052FF] to-[#00FF66] p-0.5">
            <div className="w-full h-full bg-black rounded-[4px] flex items-center justify-center text-[10px] font-mono font-bold">
              M
            </div>
          </div>
          <span className="font-bold text-sm tracking-tight">manageme OS</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 no-scrollbar">
        {categories.map((cat) => {
          const catTabs = TAB_CONFIGS.filter(t => t.category === cat.id);
          if (catTabs.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-1">
              <span className="px-2 text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                {cat.label}
              </span>

              <div className="space-y-0.5 mt-1.5">
                {catTabs.map((tab) => {
                  const Icon = ICON_MAP[tab.iconName] || Sparkles;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (onClose) onClose();
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left',
                        isActive
                          ? 'bg-[#0052FF] text-white shadow-lg shadow-[#0052FF]/20 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                        <span className="truncate">{tab.label}</span>
                      </div>

                      {tab.badge && (
                        <span className={cn(
                          'text-[9px] font-mono px-1.5 py-0.2 rounded-full',
                          isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                        )}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
