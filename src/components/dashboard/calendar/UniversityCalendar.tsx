// Component: University Calendar & Academic Timetable Station

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  BookOpen, 
  Award,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { SpatialCard } from '../../ui/SpatialCard';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { UserTrackerData } from '../../../hooks/useFirestoreData';
import { UniClass } from '../../../types';

export interface UniversityCalendarProps {
  userData?: UserTrackerData;
  updateData?: (partial: Partial<UserTrackerData>) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export const UniversityCalendar: React.FC<UniversityCalendarProps> = ({
  userData,
  updateData
}) => {
  const classes: UniClass[] = useMemo(() => {
    return Array.isArray(userData?.uniClasses) ? userData.uniClasses : [];
  }, [userData?.uniClasses]);

  const [newClass, setNewClass] = useState<Partial<UniClass>>({
    moduleName: '',
    type: 'Lecture',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    term: 'Michaelmas'
  });

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.moduleName || !newClass.startTime || !newClass.endTime) return;
    
    const item: UniClass = {
      id: `class_${Date.now()}`,
      moduleName: newClass.moduleName,
      type: (newClass.type as any) || 'Lecture',
      dayOfWeek: (newClass.dayOfWeek as any) || 'Monday',
      startTime: newClass.startTime,
      endTime: newClass.endTime,
      location: newClass.location || 'TBA',
      term: (newClass.term as any) || 'Michaelmas'
    };

    const updated = [...classes, item];
    if (updateData) {
      updateData({ uniClasses: updated });
    }

    setNewClass({
      moduleName: '',
      type: 'Lecture',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      term: 'Michaelmas'
    });
  };

  const handleDeleteClass = (id: string) => {
    const updated = classes.filter(c => c && c.id !== id);
    if (updateData) {
      updateData({ uniClasses: updated });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
            <span>University Calendar & Timetable</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Weekly lecture schedules, revision blocks, and seminar rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)]">
            {classes.length} Scheduled Classes
          </span>
        </div>
      </div>

      {/* Add Class Form */}
      <SpatialCard className="p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
        <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[var(--accent)]" />
          <span>+ Add Class / Revision Block</span>
        </h3>
        <form onSubmit={handleAddClass} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Module (e.g. Econometrics / Finance)"
            value={newClass.moduleName}
            onChange={(e) => setNewClass({ ...newClass, moduleName: e.target.value })}
          />
          <select
            value={newClass.dayOfWeek}
            onChange={(e) => setNewClass({ ...newClass, dayOfWeek: e.target.value as any })}
            className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d} className="bg-white dark:bg-slate-900 text-[var(--text-primary)]">{d}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <Input
              type="time"
              value={newClass.startTime}
              onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
              className="font-mono tabular-nums"
            />
            <span className="text-[var(--text-muted)] text-xs font-mono">to</span>
            <Input
              type="time"
              value={newClass.endTime}
              onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
              className="font-mono tabular-nums"
            />
          </div>
          <Input
            placeholder="Room / Location (e.g. Hall 101)"
            value={newClass.location}
            onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
          />
          <Button type="submit" variant="primary" className="w-full justify-center">
            + Add Class
          </Button>
        </form>
      </SpatialCard>

      {/* Empty State Check */}
      {classes.length === 0 && (
        <SpatialCard className="p-8 text-center border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
          <CalendarIcon className="w-8 h-8 mx-auto text-[var(--accent)] opacity-60 mb-2" />
          <p className="font-semibold text-[var(--text-primary)] text-sm">
            No classes scheduled.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Click &apos;+ Add Class / Revision Block&apos; above to set up your weekly schedule.
          </p>
        </SpatialCard>
      )}

      {/* Monday - Friday Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayClasses = (classes || [])
            .filter(c => c && c.dayOfWeek === day)
            .sort((a, b) => (a?.startTime || '').localeCompare(b?.startTime || ''));

          return (
            <SpatialCard key={day} className="p-3 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl flex flex-col gap-3 min-h-[160px]">
              <div className="text-center pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {day}
                </span>
              </div>

              {(dayClasses || []).map((c) => {
                if (!c) return null;
                return (
                  <div key={c.id} className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/10 relative group space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs text-[var(--accent)] font-mono truncate max-w-[110px]">
                        {c.moduleName}
                      </span>
                      <button
                        onClick={() => handleDeleteClass(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-rose-400 transition-opacity p-0.5 cursor-pointer"
                        title="Delete class"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-[10px] font-mono tabular-nums text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--accent)]" />
                      <span>{c.startTime} - {c.endTime}</span>
                    </div>

                    <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{c.location || 'TBA'}</span>
                    </div>
                  </div>
                );
              })}

              {dayClasses.length === 0 && (
                <div className="my-auto text-center py-4 text-[11px] font-mono text-[var(--text-muted)]">
                  No classes
                </div>
              )}
            </SpatialCard>
          );
        })}
      </div>
    </div>
  );
};

export default UniversityCalendar;
