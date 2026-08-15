import React, { useState, useRef } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, Award, Upload, Loader2, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { GradeEntry } from '../types';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { UniClass } from '../types';
import { useTimetable } from '../hooks/useTimetable';
import { AddToCalendar } from './AddToCalendar';

interface Props {
  userData: UserTrackerData;
  updateData: (partial: Partial<UserTrackerData>) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const UniTimetableTab: React.FC<Props> = ({ userData, updateData }) => {
  const { addClass } = useTimetable();
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'grades' | 'flashcards'>('schedule');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [flashcards, setFlashcards] = useState<{front: string, back: string}[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const notesInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newGrade, setNewGrade] = useState<Partial<GradeEntry>>({ moduleName: '', assessmentTitle: '', weight: 0, grade: 0 });

  const [newClass, setNewClass] = useState<Partial<UniClass>>({
    moduleName: '',
    type: 'Lecture',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    location: '',
    term: 'Michaelmas'
  });

  
  
  const getNextDateForDay = (dayName: string, timeStr: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const target = days.indexOf(dayName);
    const d = new Date();
    const currentDay = d.getDay();
    let distance = target - currentDay;
    if (distance < 0) distance += 7;
    d.setDate(d.getDate() + distance);
    const dateStr = d.toISOString().split('T')[0];
    return `${dateStr}T${timeStr}:00`;
  };

  const handleNotesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGeneratingCards(true);
    try {
      const formData = new FormData();
      formData.append('notes', file);

      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate flashcards');
      }

      const data = await response.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
        setActiveCardIndex(0);
        setIsFlipped(false);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingCards(false);
      if (notesInputRef.current) notesInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('timetable', file);

      const response = await fetch('/api/upload-timetable', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to parse timetable');
      }

      const data = await response.json();
      if (data.classes && Array.isArray(data.classes)) {
        const newClasses = data.classes.map((c: any, index: number) => ({
          id: Date.now().toString() + index,
          moduleName: c.module || 'Unknown',
          type: c.type || 'Lecture',
          dayOfWeek: c.day || 'Monday',
          startTime: c.startTime || '09:00',
          endTime: c.endTime || '10:00',
          location: c.location || 'TBA',
          term: c.term || 'Michaelmas'
        }));
        
        updateData({ uniClasses: [...(userData.uniClasses || []), ...newClasses] });
        alert(`Timetable imported successfully! ${newClasses.length} classes added.`);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddClass = () => {

    if (!newClass.moduleName || !newClass.startTime || !newClass.endTime) return;
    const item: UniClass = {
      id: Date.now().toString(),
      moduleName: newClass.moduleName,
      type: newClass.type as any,
      dayOfWeek: newClass.dayOfWeek as any,
      startTime: newClass.startTime,
      endTime: newClass.endTime,
      location: newClass.location || 'TBA',
      term: newClass.term as any
    };
    addClass(item);
    updateData({ uniClasses: [...userData.uniClasses, item] });
    setNewClass({ moduleName: '', type: 'Lecture', dayOfWeek: 'Monday', startTime: '', endTime: '', location: '', term: 'Michaelmas' });
  };


  const handleAddGrade = () => {
    if (!newGrade.moduleName || !newGrade.assessmentTitle || !newGrade.weight || !newGrade.grade) return;
    const entry: GradeEntry = {
      id: Date.now().toString(),
      moduleName: newGrade.moduleName,
      assessmentTitle: newGrade.assessmentTitle,
      weight: Number(newGrade.weight),
      grade: Number(newGrade.grade)
    };
    updateData({ gradeEntries: [...(userData.gradeEntries || []), entry] });
    setNewGrade({ moduleName: '', assessmentTitle: '', weight: 0, grade: 0 });
  };

  const handleDeleteGrade = (id: string) => {
    updateData({ gradeEntries: (userData.gradeEntries || []).filter(g => g.id !== id) });
  };

  const moduleAverages = (userData.gradeEntries || []).reduce((acc, g) => {
    if (!acc[g.moduleName]) acc[g.moduleName] = { totalWeight: 0, weightedSum: 0 };
    acc[g.moduleName].totalWeight += g.weight;
    acc[g.moduleName].weightedSum += (g.grade * g.weight);
    return acc;
  }, {} as Record<string, { totalWeight: number, weightedSum: number }>);

  const calculateOverallClassification = () => {
    const entries = Object.values(moduleAverages);
    if (entries.length === 0) return 0;
    
    // Simple average of module scores for now, or weighted if modules have credit weights (assuming equal module weights here)
    let totalScore = 0;
    let modulesCount = 0;
    entries.forEach((mod: any) => {
      if (mod.totalWeight > 0) {
        totalScore += (mod.weightedSum / mod.totalWeight);
        modulesCount++;
      }
    });
    return modulesCount > 0 ? (totalScore / modulesCount) : 0;
  };
  const overallGrade = calculateOverallClassification();

  const handleDeleteClass = (id: string) => {
    updateData({ uniClasses: (userData.uniClasses || []).filter(c => c.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="apple-headline text-2xl text-[var(--text-primary)]">University Timetable</h2>
        
        <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] rounded-full px-4 py-2 border border-[var(--border)] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          onClick={() => updateData({ termStatus: userData.termStatus === 'Term Time' ? 'Vacation' : 'Term Time' })}
        >
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-sm text-[var(--text-secondary)]">Status:</span>
          <span className={`text-sm font-bold ${userData.termStatus === 'Term Time' ? 'text-blue-400' : 'text-amber-400'}`}>
            {userData.termStatus}
          </span>
        </div>
      </div>


      {/* Sub-Tab Toggle */}
      <div className="flex items-center gap-2 bg-[#1c1c1e] p-1 rounded-xl w-max border border-[var(--border)]">
        <button 
          onClick={() => setActiveSubTab('schedule')}
          className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeSubTab === 'schedule' ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}
        >
          Schedule
        </button>
        <button 
          onClick={() => setActiveSubTab('grades')}
          className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeSubTab === 'grades' ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}
        >
          Grade Tracker
        </button>
        <button 
          onClick={() => setActiveSubTab('flashcards')}
          className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeSubTab === 'flashcards' ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}
        >
          AI Flashcards
        </button>
      </div>

      
      {activeSubTab === 'flashcards' && (
        <div className="space-y-6 animate-fade-in">
          <div 
            className="glass-panel p-6 rounded-3xl border border-[var(--border)] border-dashed mb-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors relative overflow-hidden"
            onClick={() => !isGeneratingCards && notesInputRef.current?.click()}
          >
            {isGeneratingCards ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">Gemini is creating your flashcards...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">AI Exam Flashcard Generator</h3>
                <p className="text-xs text-[var(--text-secondary)]">Upload Lecture Notes or Slides (PDF/TXT) to generate 5 interactive study cards.</p>
              </>
            )}
            <input 
              type="file" 
              ref={notesInputRef} 
              className="hidden" 
              accept=".pdf,.txt" 
              onChange={handleNotesUpload} 
              disabled={isGeneratingCards}
            />
          </div>

          {flashcards.length > 0 && (
            <div className="flex flex-col items-center">
              <div 
                className="w-full max-w-lg aspect-video glass-panel rounded-3xl border border-[var(--border)] shadow-xl cursor-pointer flex items-center justify-center p-8 text-center relative"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: '1000px' }}
              >
                <div 
                  className="absolute inset-0 w-full h-full transition-all duration-500 flex items-center justify-center p-8"
                  style={{ 
                    transformStyle: 'preserve-3d', 
                    transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' 
                  }}
                >
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-[rgba(255,255,255,0.02)] rounded-3xl border-2 border-purple-500/20" style={{ backfaceVisibility: 'hidden' }}>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{flashcards[activeCardIndex]?.front || ''}</h3>
                  </div>
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-purple-500/10 rounded-3xl border-2 border-purple-500/30" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
                    <p className="text-base font-medium text-purple-100">{flashcards[activeCardIndex]?.back || ''}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-6">
                <button 
                  onClick={() => { setActiveCardIndex(Math.max(0, activeCardIndex - 1)); setIsFlipped(false); }}
                  disabled={activeCardIndex === 0}
                  className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-sm font-bold text-[var(--text-secondary)]">{activeCardIndex + 1} / {flashcards.length}</span>
                <button 
                  onClick={() => { setActiveCardIndex(Math.min(flashcards.length - 1, activeCardIndex + 1)); setIsFlipped(false); }}
                  disabled={activeCardIndex === flashcards.length - 1}
                  className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'schedule' && (
        <>

      {userData.termStatus === 'Vacation' && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex items-center justify-center font-medium">
          Classes are currently in recess. Work shift conflict warnings are disabled.
        </div>
      )}

      
      {userData.termStatus === 'Vacation' && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex items-center justify-center font-medium mb-6">
          Classes are currently in recess. Work shift conflict warnings are disabled.
        </div>
      )}

      {/* Auto-Import Dropzone */}
      <div 
        className="glass-panel p-6 rounded-3xl border border-[var(--border)] border-dashed mb-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors relative overflow-hidden"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Gemini is parsing your timetable...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Auto-Import Timetable from Screenshot</h3>
            <p className="text-xs text-[var(--text-secondary)]">Drag & Drop or click to upload (Image, PDF, CSV, ICS)</p>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,.pdf,.csv,.ics" 
          onChange={handleFileUpload} 
          disabled={isUploading}
        />
      </div>

      {/* Add Class Form */}

      <div className="glass-panel p-6 rounded-3xl border border-[var(--border)]">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4"/> Add New Class</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input 
            type="text" 
            placeholder="Module Name" 
            className="apple-input bg-[#1c1c1e] border-transparent text-sm p-3" 
            value={newClass.moduleName} 
            onChange={e => setNewClass({...newClass, moduleName: e.target.value})}
          />
          <select 
            className="apple-input bg-[#1c1c1e] border-transparent text-sm p-3"
            value={newClass.type}
            onChange={e => setNewClass({...newClass, type: e.target.value as any})}
          >
            {['Lecture', 'Seminar', 'Workshop', 'Exam Prep'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            className="apple-input bg-[#1c1c1e] border-transparent text-sm p-3"
            value={newClass.dayOfWeek}
            onChange={e => setNewClass({...newClass, dayOfWeek: e.target.value as any})}
          >
            {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Location / Room" 
            className="apple-input bg-[#1c1c1e] border-transparent text-sm p-3" 
            value={newClass.location} 
            onChange={e => setNewClass({...newClass, location: e.target.value})}
          />
          <div className="flex gap-2 col-span-1 md:col-span-2">
            <input 
              type="time" 
              className="apple-input bg-[#1c1c1e] border-transparent text-sm p-3 flex-1" 
              value={newClass.startTime} 
              onChange={e => setNewClass({...newClass, startTime: e.target.value})}
            />
            <span className="flex items-center text-[var(--text-secondary)]">to</span>
            <input 
              type="time" 
              className="apple-input bg-[#1c1c1e] border-transparent text-sm p-3 flex-1" 
              value={newClass.endTime} 
              onChange={e => setNewClass({...newClass, endTime: e.target.value})}
            />
          </div>
          <select 
            className="apple-input bg-[#1c1c1e] border-transparent text-sm p-3"
            value={newClass.term}
            onChange={e => setNewClass({...newClass, term: e.target.value as any})}
          >
            {['Michaelmas', 'Epiphany', 'Easter'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button 
            onClick={handleAddClass}
            className="bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity p-3"
          >
            Add Class
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map(day => {
          const dayClasses = (userData.uniClasses || [])
            .filter(c => c.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
            
          return (
            <div key={day} className="flex flex-col gap-3">
              <div className="text-center pb-2 border-b border-[var(--border)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">{day.substring(0, 3)}</span>
              </div>
              
              {dayClasses.map(c => (
                <div key={c.id} className="relative glass-panel p-3 rounded-2xl border border-[var(--border)] group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-blue-400 truncate pr-4">{c.moduleName}</span>
                    <button 
                      onClick={() => handleDeleteClass(c.id)}
                      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-[var(--text-secondary)] hover:text-red-400 transition-all bg-[rgba(255,255,255,0.1)] rounded-md"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    {c.startTime} - {c.endTime}
                  </div>
                  <div className="mt-2 mb-2">
                    <AddToCalendar title={c.moduleName} location={c.location} startDate={getNextDateForDay(c.dayOfWeek, c.startTime)} endDate={getNextDateForDay(c.dayOfWeek, c.endTime)} />
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {c.location}
                  </div>
                  <div className="inline-block px-1.5 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-[10px] font-medium text-[var(--text-primary)]">
                    {c.type}
                  </div>
                </div>
              ))}
              
              {dayClasses.length === 0 && (
                <div className="text-center py-4 text-[10px] text-[var(--text-secondary)] opacity-50">
                  No classes
                </div>
              )}
            </div>
          );
        })}
      </div>

              </>
      )}
      {activeSubTab === 'grades' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Award className="w-4 h-4"/> Academic Grades & Weighting</h3>
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl font-bold">
                Overall Est: {overallGrade.toFixed(1)}% 
                <span className="text-xs font-normal opacity-80 ml-2">
                  ({overallGrade >= 70 ? 'Distinction' : overallGrade >= 60 ? 'Merit' : overallGrade >= 50 ? 'Pass' : 'Fail'})
                </span>
              </div>
            </div>

            {/* Add Grade Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 bg-[#1c1c1e]/50 p-4 rounded-2xl border border-[var(--border)]">
              <input type="text" placeholder="Module Name" value={newGrade.moduleName} onChange={e => setNewGrade({...newGrade, moduleName: e.target.value})} className="apple-input bg-[#1c1c1e] text-sm p-3" />
              <input type="text" placeholder="Assessment (e.g. Exam)" value={newGrade.assessmentTitle} onChange={e => setNewGrade({...newGrade, assessmentTitle: e.target.value})} className="apple-input bg-[#1c1c1e] text-sm p-3" />
              <input type="number" placeholder="Weight %" value={newGrade.weight || ''} onChange={e => setNewGrade({...newGrade, weight: Number(e.target.value)})} className="apple-input bg-[#1c1c1e] text-sm p-3" />
              <input type="number" placeholder="Grade %" value={newGrade.grade || ''} onChange={e => setNewGrade({...newGrade, grade: Number(e.target.value)})} className="apple-input bg-[#1c1c1e] text-sm p-3" />
              <button onClick={handleAddGrade} className="bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-xl text-sm p-3 hover:opacity-90 transition-opacity">
                Add Grade
              </button>
            </div>

            {/* Module Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(moduleAverages).map(modName => {
                const mod = moduleAverages[modName];
                const modEntries = (userData.gradeEntries || []).filter(g => g.moduleName === modName);
                const currentScore = mod.totalWeight > 0 ? (mod.weightedSum / mod.totalWeight) : 0;

                return (
                  <div key={modName} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[var(--border)]">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-[rgba(255,255,255,0.1)]">
                      <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{modName}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${currentScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' : currentScore >= 60 ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {currentScore.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {modEntries.map(entry => (
                        <div key={entry.id} className="flex justify-between items-center group text-xs text-[var(--text-secondary)]">
                          <span className="truncate pr-2">{entry.assessmentTitle} ({entry.weight}%)</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-medium text-[#f5f5f7]">{entry.grade}%</span>
                            <button onClick={() => handleDeleteGrade(entry.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] text-[10px] text-[var(--text-secondary)] flex justify-between">
                      <span>Total Weight Tracked:</span>
                      <span className="font-semibold text-[var(--text-primary)]">{mod.totalWeight}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
