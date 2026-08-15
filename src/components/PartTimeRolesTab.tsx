import React, { useState } from 'react';
import { Share2, ExternalLink, Clock, MapPin, Calendar as CalendarIcon, Briefcase, Plus, Trash2, AlertCircle } from 'lucide-react';
import { PartTimeRole, WorkShift } from '../types';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { AddToCalendar } from './AddToCalendar';

interface Props {
  roles?: PartTimeRole[];
  shifts?: WorkShift[];
  updateData: (partial: Partial<UserTrackerData>) => void;
}

export const PartTimeRolesTab: React.FC<Props> = ({ roles = [], shifts = [], updateData }) => {
  const [activeTab, setActiveTab] = useState<'shifts' | 'roles'>('shifts');
  
  const [newShift, setNewShift] = useState<Partial<WorkShift>>({
    description: '', date: '', startTime: '', endTime: '', hourlyRate: 12.50
  });

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.description || !newShift.date) return;
    
    const shift: WorkShift = {
      id: crypto.randomUUID(),
      description: newShift.description!,
      date: newShift.date!,
      startTime: newShift.startTime || '09:00',
      endTime: newShift.endTime || '17:00',
      hours: calculateHours(newShift.startTime || '09:00', newShift.endTime || '17:00'),
      hourlyRate: newShift.hourlyRate || 0,
      totalEarned: 0 // Mocked for now
    };
    
    updateData({ workShifts: [shift, ...shifts] });
    setNewShift({ description: '', date: '', startTime: '', endTime: '', hourlyRate: 12.50 });
  };

  const calculateHours = (s?: string, e?: string) => {
    if (!s || !e) return 0;
    const [h1, m1] = s.split(':').map(Number);
    const [h2, m2] = e.split(':').map(Number);
    if(isNaN(h1) || isNaN(h2)) return 0;
    return (h2 + (m2 || 0)/60) - (h1 + (m1 || 0)/60);
  };

  const totalHoursThisWeek = (shifts || []).reduce((acc, shift) => {
    const hours = calculateHours(shift.startTime, shift.endTime);
    return acc + (hours > 0 ? hours : 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Work & Timesheet</h1>
          <p className="text-[var(--text-secondary)] mt-1">Track shifts, monitor visa limits, and find local opportunities.</p>
        </div>
        <div className="flex bg-[rgba(255,255,255,0.05)] p-1 rounded-xl border border-[var(--border)]">
          <button onClick={() => setActiveTab('shifts')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'shifts' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}>My Shifts</button>
          <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roles' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}>Local Roles</button>
        </div>
      </div>

      {activeTab === 'shifts' ? (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--accent)]" />
                Visa Limit Guardrails
              </h3>
              <span className="text-2xl font-bold text-[var(--text-primary)]">{totalHoursThisWeek.toFixed(1)} / 20 hrs</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${totalHoursThisWeek > 20 ? 'bg-red-500' : totalHoursThisWeek > 15 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min((totalHoursThisWeek / 20) * 100, 100)}%` }}
              ></div>
            </div>
            {totalHoursThisWeek > 20 && (
              <p className="mt-3 text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Warning: You have exceeded the 20-hour weekly limit for student visas.</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <form onSubmit={handleAddShift} className="glass-panel p-6 rounded-2xl border border-[var(--border)] space-y-4">
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Log New Shift</h3>
                <input type="text" placeholder="Shift Title / Location" required value={newShift.description} onChange={e => setNewShift({...newShift, description: e.target.value})} className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]" />
                <input type="date" required value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]" />
                <div className="flex gap-4">
                  <input type="time" required value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} className="w-1/2 bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]" />
                  <input type="time" required value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} className="w-1/2 bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg)] font-bold shadow-lg hover:opacity-90 transition-opacity">Add Shift</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {shifts.length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-2xl border border-[var(--border)]">
                  <Briefcase className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-4" />
                  <h4 className="text-[var(--text-primary)] font-semibold mb-2">No shifts logged yet</h4>
                  <p className="text-[var(--text-secondary)] text-sm">Log your first shift to start tracking hours.</p>
                </div>
              ) : (
                shifts.map(shift => (
                  <div key={shift.id} className="glass-panel p-5 rounded-2xl border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-[var(--text-primary)] font-bold">{shift.description}</h4>
                      <p className="text-[var(--text-secondary)] text-sm mt-1">{shift.date} • {shift.startTime} to {shift.endTime}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <AddToCalendar 
                        title={shift.description || 'Work Shift'}
                        description="Part-time work shift"
                        startDate={`${shift.date}T${shift.startTime}:00`}
                        endDate={`${shift.date}T${shift.endTime}:00`}
                      />
                      <button 
                        onClick={() => updateData({ workShifts: shifts.filter(s => s.id !== shift.id) })}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-[var(--border)] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{role.firm}</h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium mb-4">{role.roleTitle}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-xs text-[var(--text-secondary)]">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-[var(--accent)]" /> {role.location}
                  </div>
                  <div className="flex items-center text-xs text-[var(--text-secondary)]">
                    <Clock className="w-3.5 h-3.5 mr-2 text-[var(--accent)]" /> {role.ratePerHour}
                  </div>
                </div>
              </div>
              <a href={role.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-sm font-semibold">
                View Role <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
