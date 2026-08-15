import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Clock, DollarSign, Plane, Building, FileText, ArrowRight, X, Bike, Sparkles, Loader2, FileSpreadsheet } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { AppTab } from './Header';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { useScrollLock } from '../hooks/useScrollLock';
import { tflApi } from '../services/tflApi';
import { isAnnualReportFetchCommand, fetchAnnualReport, saveAndGroundAnnualReport } from '../utils/annualReportPipeline';
import { ImportProgressBar } from './ImportProgressBar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userData: UserTrackerData;
  setActiveTab: (tab: AppTab) => void;
  updateData?: (data: any) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  icon: React.ReactNode;
  tab: AppTab;
  score: number;
  isAction?: boolean;
  actionHandler?: () => void;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, userData, setActiveTab, updateData }) => {
  const [query, setQuery] = useState('');
  const [transitResults, setTransitResults] = useState<SearchResult[]>([]);
  const [isFetchingReport, setIsFetchingReport] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchMsg, setFetchMsg] = useState('');
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useModalDismiss(isOpen, onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setTransitResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      const searchTransit = async () => {
        try {
          const res = await tflApi.searchBikePoints(query);
          const formatted = res.map(bike => ({
            id: bike.id,
            title: bike.commonName,
            subtitle: `Transit • Cycle Hire (${bike.additionalProperties.find((p: any) => p.key === 'NbBikes')?.value || '0'} bikes)`,
            type: 'Transit',
            icon: <Bike className="w-4 h-4 text-emerald-400" />,
            tab: 'transit' as AppTab,
            score: 1
          }));
          setTransitResults(formatted);
        } catch (err) {
          // Ignore
        }
      };
      
      const timeout = setTimeout(searchTransit, 500);
      return () => clearTimeout(timeout);
    } else {
      setTransitResults([]);
    }
  }, [query]);

  const actionResults: SearchResult[] = [];

  const handleExecuteAnnualReportFetch = async (company: string, year: string) => {
    setTargetCompanyName(`${company} (${year})`);
    setIsFetchingReport(true);
    setFetchProgress(15);
    setFetchMsg(`Searching SEC EDGAR database for ${company} ${year} annual report...`);

    try {
      setTimeout(() => {
        setFetchProgress(45);
        setFetchMsg(`Retrieving official 10-K filing text & statements for ${company}...`);
      }, 1000);

      setTimeout(() => {
        setFetchProgress(75);
        setFetchMsg(`Linking Active Grounding Context in Study Engine...`);
      }, 2200);

      const doc = await fetchAnnualReport(company, year);
      saveAndGroundAnnualReport(doc, userData, updateData);

      setFetchProgress(100);
      setFetchMsg(`Annual Report successfully linked! Launching Analysis Suite...`);

      setTimeout(() => {
        setIsFetchingReport(false);
        setActiveTab('study');
        onClose();
      }, 600);
    } catch (err: any) {
      console.error(err);
      alert('Error fetching annual report: ' + err.message);
      setIsFetchingReport(false);
    }
  };

  // Check if query is an Annual Report Command
  const reportCmd = isAnnualReportFetchCommand(query);
  if (reportCmd.isMatch) {
    actionResults.push({
      id: 'action-fetch-annual-report',
      title: `Fetch & Ground ${reportCmd.company} ${reportCmd.year} Annual Report`,
      subtitle: `Natural Language Pipeline • Auto-fetch SEC EDGAR 10-K & Ground in Intelligence Engine`,
      type: 'Action',
      icon: <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />,
      tab: 'study',
      score: 10,
      isAction: true,
      actionHandler: () => handleExecuteAnnualReportFetch(reportCmd.company, reportCmd.year)
    });
  }

  const results: SearchResult[] = [];

  const addResult = (item: SearchResult) => {
    if (query) {
      const searchStr = `${item.title} ${item.subtitle} ${item.type}`.toLowerCase();
      if (searchStr.includes(query.toLowerCase())) {
        results.push(item);
      }
    } else {
      results.push(item);
    }
  };

  // Add Grad Schemes
  userData.gradSchemes?.forEach(scheme => {
    addResult({
      id: scheme.id,
      title: `${scheme.firm} - ${scheme.roleTitle}`,
      subtitle: `Grad Scheme • ${scheme.status}`,
      type: 'Job',
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      tab: 'jobs',
      score: 1
    });
  });

  // Add Part Time Roles
  userData.partTimeRoles?.forEach(role => {
    addResult({
      id: role.id,
      title: `${role.firm} - ${role.roleTitle}`,
      subtitle: `Part-Time • ${role.status}`,
      type: 'Job',
      icon: <Building className="w-4 h-4 text-purple-400" />,
      tab: 'jobs',
      score: 1
    });
  });

  // Add Shifts
  userData.workShifts?.forEach(shift => {
    addResult({
      id: shift.id,
      title: `Shift on ${shift.date}`,
      subtitle: `${shift.hours} hrs • ${shift.description || 'Work'}`,
      type: 'Work',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      tab: 'work',
      score: 1
    });
  });

  // Add Expenses
  userData.expenses?.forEach(exp => {
    addResult({
      id: exp.id,
      title: `${exp.category} - £${exp.amount}`,
      subtitle: exp.description || 'Expense',
      type: 'Finance',
      icon: <DollarSign className="w-4 h-4 text-rose-400" />,
      tab: 'finance',
      score: 1
    });
  });

  // Add Trips & Itineraries
  userData.trips?.forEach(trip => {
    addResult({
      id: trip.id,
      title: `Trip to ${trip.destination}`,
      subtitle: `${trip.startDate} - ${trip.endDate}`,
      type: 'Travel',
      icon: <Plane className="w-4 h-4 text-sky-400" />,
      tab: 'travel',
      score: 1
    });

    trip.itinerary?.forEach(day => {
      day.events?.forEach(evt => {
        addResult({
          id: evt.id,
          title: `${evt.title} (${trip.destination})`,
          subtitle: `${day.date} @ ${evt.time} • Itinerary`,
          type: 'Travel',
          icon: <Plane className="w-4 h-4 text-sky-400" />,
          tab: 'travel',
          score: 1
        });
      });
    });
  });

  // Add Skills
  userData.skillsTracker?.forEach(skill => {
    addResult({
      id: skill.id,
      title: `${skill.name} (${skill.proficiency})`,
      subtitle: `Skill • ${skill.category} • ${skill.verified ? 'Verified' : 'In Progress'}`,
      type: 'Skill',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      tab: 'skills',
      score: 1
    });
  });

  // Add Courses
  userData.courses?.forEach(course => {
    addResult({
      id: course.id,
      title: `${course.title} - ${course.provider}`,
      subtitle: `Course • ${course.status} • ${course.progress}% completed`,
      type: 'Course',
      icon: <Building className="w-4 h-4 text-cyan-400" />,
      tab: 'skills',
      score: 1
    });
  });

  // Add Universal Tasks
  userData.universalTasks?.forEach(task => {
    addResult({
      id: task.id,
      title: `[${task.priority}] ${task.title}`,
      subtitle: `Task • ${task.category || 'General'} • ${task.completed ? 'Completed' : 'Pending'}`,
      type: 'Task',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      tab: 'tasks',
      score: 1
    });
  });

  // Add Notes Sections
  userData.notesSections?.forEach(note => {
    addResult({
      id: note.id,
      title: note.title,
      subtitle: 'Note Section',
      type: 'Note',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      tab: 'tasks',
      score: 1
    });
  });
  
  const allResults = [...actionResults, ...results, ...transitResults].slice(0, 8); // Limit to top 8

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-[#18181B] border border-[#2A2A2D] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center px-4 py-3 border-b border-[#2A2A2D] gap-3 relative">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder='Try "download Tesla 2025 annual report" or search applications...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-gray-500 text-lg"
            />
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-2 custom-scrollbar">
            {allResults.length > 0 ? (
              <div className="space-y-1">
                {allResults.map((result, i) => (
                  <button
                    key={`${result.id}-${i}`}
                    onClick={() => {
                      if (result.isAction && result.actionHandler) {
                        result.actionHandler();
                      } else {
                        setActiveTab(result.tab);
                        onClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group text-left ${
                      result.isAction ? 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20' : 'hover:bg-[#2A2A2D]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#111114] rounded-lg border border-[#2A2A2D] group-hover:border-gray-500 transition-colors">
                        {result.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{result.title}</span>
                          {result.isAction && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500 text-black font-bold">
                              Command Action
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{result.subtitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-emerald-400 font-semibold">{result.isAction ? 'Execute' : `Go to ${result.tab}`}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 text-sm">
                {query ? `No results found for "${query}"` : 'Type to start searching... e.g. "fetch Tesla 2025 annual report"'}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Annual Report Fetch Progress Bar */}
      <ImportProgressBar
        isProcessing={isFetchingReport}
        progress={fetchProgress}
        stepMessage={fetchMsg}
        fileName={targetCompanyName}
        title="SEC EDGAR Annual Report Fetch Pipeline"
        onCancel={() => setIsFetchingReport(false)}
      />
    </>
  );
};
