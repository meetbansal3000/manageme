// Component: University Timetable & Academic Calendar Station

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
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { UserTrackerData } from '../../../hooks/useFirestoreData';
import { UniClass } from '../../../types';

export interface UniversityTimetableProps {
  userData?: UserTrackerData;
  updateData?: (partial: Partial<UserTrackerData>) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export const UniversityTimetable: React.FC<UniversityTimetableProps> = ({
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
    const updated = classes.filter(c => c.id !== id);
    if (updateData) {
      updateData({ uniClasses: updated });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>University Timetable & Calendar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Weekly lecture schedules, tutorial timings, and room locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
            {classes.length} Scheduled Classes
          </span>
        </div>
      </div>

      {/* Add Class Form */}
      <Card variant="glass" padding="md" className="border border-white/10">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          <span>Add Academic Class</span>
        </h3>
        <form onSubmit={handleAddClass} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Module (e.g. Econometrics)"
            value={newClass.moduleName}
            onChange={(e) => setNewClass({ ...newClass, moduleName: e.target.value })}
          />
          <select
            value={newClass.dayOfWeek}
            onChange={(e) => setNewClass({ ...newClass, dayOfWeek: e.target.value as any })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          >
            {DAYS_OF_WEEK.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
          </select>
          <div className="flex gap-2">
            <Input
              type="time"
              value={newClass.startTime}
              onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
            />
            <Input
              type="time"
              value={newClass.endTime}
              onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
            />
          </div>
          <Input
            placeholder="Room / Hall (e.g. TLC 101)"
            value={newClass.location}
            onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
          />
          <Button type="submit" variant="primary" className="w-full justify-center">
            + Add Class
          </Button>
        </form>
      </Card>

      {/* Empty State Check */}
      {classes.length === 0 && (
        <Card variant="glass" padding="lg" className="border border-white/10 text-center py-10">
          <CalendarIcon className="w-8 h-8 mx-auto text-blue-400 opacity-60 mb-2" />
          <p className="font-semibold text-white text-sm">
            No lectures scheduled for this week. Click '+ Add Class' to set up your timetable.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Build your semester routine and sync with Visa work shift limits.
          </p>
        </Card>
      )}

      {/* Monday - Friday Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayClasses = (classes || [])
            .filter(c => c && c.dayOfWeek === day)
            .sort((a, b) => (a?.startTime || '').localeCompare(b?.startTime || ''));

          return (
            <Card key={day} variant="glass" padding="sm" className="border border-white/10 flex flex-col gap-3 min-h-[160px]">
              <div className="text-center pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  {day}
                </span>
              </div>

              {(dayClasses || []).map((c) => {
                if (!c) return null;
                return (
                  <div key={c.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 relative group space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs text-blue-400 font-mono truncate max-w-[110px]">
                        {c.moduleName}
                      </span>
                      <button
                        onClick={() => handleDeleteClass(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                        title="Delete class"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{c.startTime} - {c.endTime}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{c.location || 'TBA'}</span>
                    </div>
                  </div>
                );
              })}

              {dayClasses.length === 0 && (
                <div className="my-auto text-center py-4 text-[11px] font-mono text-slate-600">
                  No classes
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UniversityTimetable;
