import React, { useMemo } from 'react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import { useState } from 'react';

export const MorningBriefing: React.FC<{ userData: UserTrackerData }> = ({ userData }) => {
  const [strategy, setStrategy] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeWeek = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const last7DaysHours = (userData.workShifts || []).filter(s => {
        const d = new Date(s.date);
        return (today.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000 && d <= today;
      }).reduce((sum, s) => sum + s.hours, 0);
      const visaRemaining = Math.max(0, 20 - last7DaysHours);

      const response = await fetch('/api/analyze-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classes: userData.uniClasses,
          shifts: userData.workShifts,
          deadlines: userData.priorityItems,
          visaRemaining
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.strategy) setStrategy(data.strategy);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const briefing = useMemo(() => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-US', { weekday: 'long' });
    const todayISO = today.toISOString().split('T')[0];
    
    // Classes today
    const classesToday = (userData.uniClasses || []).filter(c => c.dayOfWeek === todayStr);
    
    // Shifts today
    const shiftsToday = (userData.workShifts || []).filter(s => s.date === todayISO);
    
    // Visa hours
    const last7DaysHours = (userData.workShifts || []).filter(s => {
      const d = new Date(s.date);
      return (today.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000 && d <= today;
    }).reduce((sum, s) => sum + s.hours, 0);
    const visaRemaining = Math.max(0, 20 - last7DaysHours);

    // Deadlines within 7 days
    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);
    const upcomingDeadlines = (userData.priorityItems || []).filter(p => {
      if (!p.deadline || p.status === 'Offer 🎉' || p.status === 'Rejected ✕' || p.status === 'Rejected' || p.status === 'Applied ✓') return false;
      const d = new Date(p.deadline);
      return d >= today && d <= next7Days;
    });

    const bullets = [];
    if (classesToday.length > 0) {
      const sortedClasses = [...classesToday].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      const firstClass = sortedClasses[0];
      const moduleName = firstClass?.moduleName || 'Class';
      const startTime = firstClass?.startTime || 'TBD';
      bullets.push(`📚 ${classesToday.length} class${classesToday.length > 1 ? 'es' : ''} today (First: ${moduleName} at ${startTime}).`);
    } else {
      bullets.push(`📚 No university classes scheduled today.`);
    }

    if (shiftsToday.length > 0) {
      const shiftHours = shiftsToday[0]?.hours ?? 0;
      bullets.push(`💼 Work shift scheduled today for ${shiftHours} hours. (${visaRemaining.toFixed(1)} hrs left on Visa limit)`);
    } else {
      bullets.push(`💼 No work shifts today. (${visaRemaining.toFixed(1)} hrs left on Visa limit)`);
    }

    if (upcomingDeadlines.length > 0) {
      bullets.push(`⚠️ ${upcomingDeadlines.length} priority deadline${upcomingDeadlines.length > 1 ? 's' : ''} approaching in the next 7 days.`);
    } else {
      bullets.push(`✅ No urgent deadlines in the next 7 days.`);
    }

    return bullets;
  }, [userData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="glass-panel border border-[var(--border)] rounded-2xl p-4 flex flex-row justify-between items-center w-full gap-4 flex-wrap md:flex-nowrap mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Daily Briefing</h3>
            <p className="text-xs text-[var(--text-secondary)]">Your personalized snapshot for today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 md:pl-6 md:border-l border-[rgba(255,255,255,0.1)]">
          {briefing.map((b, i) => (
            <p key={i} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50 shrink-0"></span>
              {b}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
          <button 
            onClick={handleAnalyzeWeek}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-colors whitespace-nowrap justify-center"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
            Analyze My Week with AI
          </button>
        </div>


      {strategy && (
        <div className="mt-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 animate-fade-in">
          <h4 className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3"/> AI Week Strategy</h4>
          <ol className="list-decimal list-inside text-xs text-[var(--text-secondary)] space-y-1">
            {strategy.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      </div>
    </div>
  );
};
