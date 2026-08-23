// Component: Accessible Segmented Tabs Primitive

import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className
}) => {
  return (
    <div className={cn('flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
              isActive
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
