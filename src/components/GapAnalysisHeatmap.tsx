import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  TrendingUp, 
  Target, 
  HelpCircle,
  Building2,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Zap
} from 'lucide-react';
import { GraduateScheme, SkillTask, CourseCertification, SkillProficiency } from '../types';
import { GRADUATE_SCHEMES_DATA } from '../data/trackerData';

interface GapAnalysisHeatmapProps {
  skills: SkillTask[];
  courses?: CourseCertification[];
  gradSchemes?: GraduateScheme[];
  onAddMissingSkill?: (skillName: string, category: string, defaultProficiency?: SkillProficiency) => void;
  onNavigateToFull?: () => void;
  onOpenResolver?: () => void;
  compact?: boolean;
}

// Common category mapping for skills
const SKILL_CATEGORY_MAP: Record<string, string> = {
  'Financial Modeling': 'Technical',
  '3-Statement Modeling': 'Technical',
  'Valuation': 'Technical',
  'DCF': 'Technical',
  'LBO': 'Technical',
  'Python': 'Quantitative',
  'Asset Allocation': 'Quantitative',
  'Fixed Income': 'Domain Knowledge',
  'Equity Research': 'Domain Knowledge',
  'M&A Advisory': 'Domain Knowledge',
  'Corporate Finance': 'Technical',
  'Financial Reporting': 'Accounting',
  'Xero': 'Accounting',
  'Power BI': 'Analytics',
  'Restructuring': 'Domain Knowledge',
  'Due Diligence': 'Technical',
  'Private Credit': 'Domain Knowledge',
  'Real Estate PE': 'Domain Knowledge',
  'Aladdin': 'Technical',
  'ESG': 'Domain Knowledge',
  'Pitch Decks': 'Soft Skills',
  'Public Speaking': 'Soft Skills'
};

export const GapAnalysisHeatmap: React.FC<GapAnalysisHeatmapProps> = ({
  skills = [],
  courses = [],
  gradSchemes,
  onAddMissingSkill,
  onNavigateToFull,
  onOpenResolver,
  compact = false
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [hoveredCell, setHoveredCell] = useState<{ firm: string; skill: string } | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Fallback to empty schemes if none provided
  const schemesList: GraduateScheme[] = useMemo(() => {
    if (gradSchemes && gradSchemes.length > 0) return gradSchemes;
    return [];
  }, [gradSchemes]);

  // Extract all unique requirement keywords across all schemes
  const allRequiredSkills = useMemo(() => {
    const skillSet = new Set<string>();
    schemesList.forEach(scheme => {
      if (scheme.skills && Array.isArray(scheme.skills)) {
        scheme.skills.forEach(s => skillSet.add(s.trim()));
      }
    });

    // If schemes have no skills defined, provide sensible standard defaults for finance schemes
    if (skillSet.size === 0) {
      ['Financial Modeling', 'Valuation', 'Python', 'DCF', 'LBO', 'M&A Advisory', 'Financial Reporting', 'Fixed Income', 'Power BI'].forEach(s => skillSet.add(s));
    }

    return Array.from(skillSet);
  }, [schemesList]);

  // Normalize user skills for fuzzy matching
  const userSkillMap = useMemo(() => {
    const map = new Map<string, { status: 'verified' | 'in_progress' | 'beginner'; rating: number; originalName: string; proficiency: string }>();

    skills.forEach(s => {
      const lower = s.name.toLowerCase();
      const isVerified = s.status === 'Done' || s.proficiency === 'Master' || s.proficiency === 'Advanced' || (s.rating && s.rating >= 4);
      const isInProgress = s.status === 'In Progress' || s.proficiency === 'Intermediate' || (s.rating && s.rating >= 2);

      const statusType: 'verified' | 'in_progress' | 'beginner' = isVerified ? 'verified' : isInProgress ? 'in_progress' : 'beginner';

      map.set(lower, {
        status: statusType,
        rating: s.rating || (isVerified ? 4 : 2),
        originalName: s.name,
        proficiency: s.proficiency || 'Intermediate'
      });
    });

    // Also include completed courses skills
    courses.forEach(c => {
      if (c.skillsAcquired && Array.isArray(c.skillsAcquired)) {
        c.skillsAcquired.forEach(sk => {
          const lower = sk.toLowerCase();
          if (!map.has(lower)) {
            const isCompleted = c.status === 'Completed' || c.progress === 100;
            map.set(lower, {
              status: isCompleted ? 'verified' : 'in_progress',
              rating: isCompleted ? 4 : 2,
              originalName: sk,
              proficiency: isCompleted ? 'Advanced' : 'Intermediate'
            });
          }
        });
      }
    });

    return map;
  }, [skills, courses]);

  // Helper to check match status of a specific required skill keyword
  const getSkillMatch = (requiredSkill: string): { 
    matched: boolean; 
    status: 'verified' | 'in_progress' | 'gap'; 
    rating?: number;
    userSkillTitle?: string;
    proficiency?: string;
  } => {
    const reqLower = requiredSkill.toLowerCase();

    // 1. Direct match
    if (userSkillMap.has(reqLower)) {
      const found = userSkillMap.get(reqLower)!;
      return { 
        matched: true, 
        status: found.status === 'verified' ? 'verified' : 'in_progress',
        rating: found.rating,
        userSkillTitle: found.originalName,
        proficiency: found.proficiency
      };
    }

    // 2. Partial / substring matches (e.g. "Financial Modeling" matches "Financial Modeling & 3-Statement Forecasting")
    for (const [userSkillLower, data] of userSkillMap.entries()) {
      if (userSkillLower.includes(reqLower) || reqLower.includes(userSkillLower)) {
        return { 
          matched: true, 
          status: data.status === 'verified' ? 'verified' : 'in_progress',
          rating: data.rating,
          userSkillTitle: data.originalName,
          proficiency: data.proficiency
        };
      }
      
      // Special aliases
      if (reqLower === 'dcf' && userSkillLower.includes('dcf')) return { matched: true, status: data.status === 'verified' ? 'verified' : 'in_progress', rating: data.rating, userSkillTitle: data.originalName, proficiency: data.proficiency };
      if (reqLower === 'lbo' && userSkillLower.includes('lbo')) return { matched: true, status: data.status === 'verified' ? 'verified' : 'in_progress', rating: data.rating, userSkillTitle: data.originalName, proficiency: data.proficiency };
      if (reqLower.includes('ifrs') && userSkillLower.includes('ifrs')) return { matched: true, status: data.status === 'verified' ? 'verified' : 'in_progress', rating: data.rating, userSkillTitle: data.originalName, proficiency: data.proficiency };
      if (reqLower.includes('3-statement') && userSkillLower.includes('3-statement')) return { matched: true, status: data.status === 'verified' ? 'verified' : 'in_progress', rating: data.rating, userSkillTitle: data.originalName, proficiency: data.proficiency };
    }

    return { matched: false, status: 'gap' };
  };

  // Filter schemes by sector and search keyword
  const filteredSchemes = useMemo(() => {
    return schemesList.filter(s => {
      const matchesSector = selectedSector === 'All' || s.sector === selectedSector;
      const matchesSearch = !searchKeyword || 
        s.firm.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        s.roleTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (s.skills && s.skills.some(sk => sk.toLowerCase().includes(searchKeyword.toLowerCase())));
      return matchesSector && matchesSearch;
    });
  }, [schemesList, selectedSector, searchKeyword]);

  // Calculate readiness match score per scheme
  const schemeScores = useMemo(() => {
    const scores: Record<string, { total: number; verified: number; inProgress: number; gaps: number; matchPercent: number; missingSkills: string[] }> = {};

    schemesList.forEach(scheme => {
      const reqs = scheme.skills || [];
      if (reqs.length === 0) {
        scores[scheme.id] = { total: 0, verified: 0, inProgress: 0, gaps: 0, matchPercent: 100, missingSkills: [] };
        return;
      }

      let verified = 0;
      let inProgress = 0;
      let gaps = 0;
      const missingSkills: string[] = [];

      reqs.forEach(sk => {
        const match = getSkillMatch(sk);
        if (match.status === 'verified') verified++;
        else if (match.status === 'in_progress') inProgress++;
        else {
          gaps++;
          missingSkills.push(sk);
        }
      });

      // Match formula: (verified * 1.0 + inProgress * 0.5) / total * 100
      const score = Math.round(((verified + inProgress * 0.5) / reqs.length) * 100);
      scores[scheme.id] = {
        total: reqs.length,
        verified,
        inProgress,
        gaps,
        matchPercent: Math.min(100, score),
        missingSkills
      };
    });

    return scores;
  }, [schemesList, userSkillMap]);

  // Aggregate high-priority missing keywords with frequency
  const missingKeywordsFrequency = useMemo(() => {
    const map = new Map<string, { count: number; schemes: string[] }>();

    schemesList.forEach(scheme => {
      const reqs = scheme.skills || [];
      reqs.forEach(sk => {
        const match = getSkillMatch(sk);
        if (match.status === 'gap') {
          const existing = map.get(sk) || { count: 0, schemes: [] };
          existing.count += 1;
          existing.schemes.push(scheme.firm);
          map.set(sk, existing);
        }
      });
    });

    return Array.from(map.entries())
      .map(([keyword, data]) => ({ keyword, count: data.count, schemes: data.schemes }))
      .sort((a, b) => b.count - a.count);
  }, [schemesList, userSkillMap]);

  // Overall aggregate stats
  const aggregateStats = useMemo(() => {
    const schemeKeys = Object.keys(schemeScores);
    let totalScore = 0;
    schemeKeys.forEach((key) => {
      totalScore += schemeScores[key]?.matchPercent || 0;
    });
    const avgMatch = schemeKeys.length === 0 ? 0 : Math.round(totalScore / schemeKeys.length);
    const totalGapsCount = missingKeywordsFrequency.length;
    const totalVerifiedSkillsCount = skills.filter(s => s.status === 'Done' || s.proficiency === 'Master' || s.proficiency === 'Advanced').length;

    return {
      avgMatch,
      totalGapsCount,
      totalVerifiedSkillsCount
    };
  }, [schemeScores, missingKeywordsFrequency, skills]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    schemesList.forEach(s => { if (s.sector) set.add(s.sector); });
    return ['All', ...Array.from(set)];
  }, [schemesList]);

  // If compact mode is enabled, render the embedded visual matrix card
  if (compact) {
    const topSchemes = filteredSchemes.slice(0, 5);
    const topSkills = allRequiredSkills.slice(0, 8);

    return (
      <div id="skillsGapAnalysisCompactCard" className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Graduate Scheme Gap Analysis & Keyword Heatmap
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Target Benchmarks
                </span>
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Mapping your verified skills against recruitment criteria across {schemesList.length} finance schemes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenResolver && (
              <button
                type="button"
                onClick={onOpenResolver}
                id="launchResolverCompactBtn"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Resolve Gaps ({aggregateStats.totalGapsCount})</span>
              </button>
            )}

            {onNavigateToFull && (
              <button
                type="button"
                onClick={onNavigateToFull}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                <span>Full Heatmap</span>
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">Average Match</span>
              <div className="text-xl font-bold font-space-mono text-emerald-400">
                {aggregateStats.avgMatch}%
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">Verified Competencies</span>
              <div className="text-xl font-bold font-space-mono text-cyan-400">
                {aggregateStats.totalVerifiedSkillsCount} <span className="text-xs text-neutral-500 font-normal">active</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">Missing Target Keywords</span>
              <div className="text-xl font-bold font-space-mono text-rose-400">
                {aggregateStats.totalGapsCount} <span className="text-xs text-neutral-500 font-normal">gaps</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* High-Impact Missing Keywords Spotlight */}
        {missingKeywordsFrequency.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-rose-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" /> High-Impact Missing Keywords (Click to add to skills tracker)
              </span>
              <span className="text-[10px] text-rose-400 font-mono">
                {missingKeywordsFrequency.length} keywords detected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {missingKeywordsFrequency.slice(0, 6).map(({ keyword, count }) => {
                const category = SKILL_CATEGORY_MAP[keyword] || 'Technical';
                return (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => {
                      if (onAddMissingSkill) {
                        onAddMissingSkill(keyword, category, 'Beginner');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-900/30 hover:bg-rose-800/50 border border-rose-700/50 hover:border-rose-500 text-rose-200 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
                    title={`Required by ${count} programs. Click to add to your skills!`}
                  >
                    <Plus className="w-3 h-3 text-rose-400" />
                    <span className="font-semibold">{keyword}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 font-mono">
                      {count} {count === 1 ? 'firm' : 'firms'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Compact Heatmap Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/80">
          <table className="w-full border-collapse text-left text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/80 text-[11px] font-mono">
                <th className="py-2.5 px-3 font-semibold text-neutral-300 w-48">
                  Target Firm
                </th>
                <th className="py-2.5 px-2 font-semibold text-center text-neutral-300 w-20">
                  Match
                </th>
                {topSkills.map(skill => (
                  <th key={skill} className="py-2.5 px-2 font-semibold text-center text-neutral-400 whitespace-nowrap text-[10px]">
                    <span className="block max-w-[85px] truncate mx-auto">
                      {skill}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
              {topSchemes.map(scheme => {
                const score = schemeScores[scheme.id] || { total: 0, verified: 0, inProgress: 0, gaps: 0, matchPercent: 100, missingSkills: [] };
                const schemeReqs = new Set((scheme.skills || []).map(s => s.trim().toLowerCase()));

                return (
                  <tr key={scheme.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{scheme.firm}</span>
                        <span className="text-[9px] px-1 rounded bg-neutral-800 text-neutral-400">{scheme.sector}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        score.matchPercent >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        score.matchPercent >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {score.matchPercent}%
                      </span>
                    </td>

                    {topSkills.map(skill => {
                      const isRequired = schemeReqs.has(skill.toLowerCase());
                      if (!isRequired) {
                        return (
                          <td key={skill} className="py-2.5 px-2 text-center text-neutral-700">
                            -
                          </td>
                        );
                      }

                      const match = getSkillMatch(skill);
                      if (match.status === 'verified') {
                        return (
                          <td key={skill} className="py-2.5 px-2 text-center">
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-400" title={`✓ Verified: ${match.userSkillTitle}`}>
                              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          </td>
                        );
                      }

                      if (match.status === 'in_progress') {
                        return (
                          <td key={skill} className="py-2.5 px-2 text-center">
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-400" title={`⏳ Developing: ${match.userSkillTitle}`}>
                              <Clock className="w-3 h-3" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={skill} className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (onAddMissingSkill) {
                                onAddMissingSkill(skill, SKILL_CATEGORY_MAP[skill] || 'Technical', 'Beginner');
                              }
                            }}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900 hover:border-rose-400 text-rose-400 transition-all cursor-pointer"
                            title={`⚠️ Missing keyword: ${skill}. Click to add to your skills!`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <Clock className="w-3 h-3 text-amber-400" /> In Progress
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Missing Gap (Click + to add)
            </span>
          </div>

          {onNavigateToFull && (
            <button
              type="button"
              onClick={onNavigateToFull}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore all {schemesList.length} schemes</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="skillsGapAnalysisHeatmapContainer" className="space-y-6">
      
      {/* Header & Metric Highlights */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-5">
        
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Gap Analysis & Keyword Heatmap
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Graduate Scheme Benchmark
                </span>
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Cross-references your verified competencies against recruitment criteria from target schemes (BlackRock, Lazard, Schroders, etc.)
            </p>
          </div>

          {/* View Mode Toggle & Resolver Action */}
          <div className="flex items-center gap-2">
            {onOpenResolver && (
              <button
                type="button"
                onClick={onOpenResolver}
                id="launchResolverFullBtn"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Skills Gap Resolver</span>
                <span className="px-1.5 py-0.2 rounded-md bg-neutral-950/20 text-[10px] font-mono">
                  {aggregateStats.totalGapsCount} gaps
                </span>
              </button>
            )}

            <div className="flex p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Heatmap Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Firm Readiness
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Stat Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-400 block font-semibold">Scheme Readiness Match</span>
              <div className="text-2xl font-bold font-space-mono text-emerald-400 mt-0.5">
                {aggregateStats.avgMatch}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-400 block font-semibold">Verified Competencies</span>
              <div className="text-2xl font-bold font-space-mono text-cyan-400 mt-0.5">
                {aggregateStats.totalVerifiedSkillsCount} <span className="text-xs text-neutral-500 font-normal">in matrix</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-400 block font-semibold">Missing Target Keywords</span>
              <div className="text-2xl font-bold font-space-mono text-rose-400 mt-0.5">
                {aggregateStats.totalGapsCount} <span className="text-xs text-neutral-500 font-normal">gaps to close</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Missing Keywords Spotlight & 1-Click Action Bar */}
        {missingKeywordsFrequency.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider">
                  High-Impact Missing Keywords (Click to add to your skills list)
                </h4>
              </div>
              <span className="text-[10px] text-rose-400 font-mono">
                Demanded by {schemesList.length} target programs
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {missingKeywordsFrequency.map(({ keyword, count, schemes }) => {
                const category = SKILL_CATEGORY_MAP[keyword] || 'Technical';
                return (
                  <button
                    key={keyword}
                    type="button"
                    id={`addMissingSkillBtn-${keyword.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => {
                      if (onAddMissingSkill) {
                        onAddMissingSkill(keyword, category, 'Beginner');
                      }
                    }}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-900/30 hover:bg-rose-800/50 border border-rose-700/50 hover:border-rose-500 text-rose-200 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
                    title={`Required by ${schemes.join(', ')}. Click to add to your skill tracker!`}
                  >
                    <Plus className="w-3 h-3 text-rose-400 group-hover:rotate-90 transition-transform" />
                    <span className="font-semibold">{keyword}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 font-mono">
                      {count} {count === 1 ? 'firm' : 'firms'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          {/* Sector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-neutral-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Sector:
            </span>
            {sectors.map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSector(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedSector === sec
                    ? 'bg-[var(--accent)] text-white font-bold shadow-sm'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search scheme or skill..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE HEATMAP MATRIX */}
      {/* ========================================================================= */}
      {viewMode === 'matrix' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl overflow-hidden space-y-4">
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800 text-xs">
            <div className="flex items-center gap-2 text-neutral-300 font-semibold">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              <span>Competency Verification Heatmap</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/60 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span className="text-emerald-300 font-medium">Verified / Mastered (100%)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/60 flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                </div>
                <span className="text-amber-300 font-medium">In Progress (50%)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/60 flex items-center justify-center">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                </div>
                <span className="text-rose-300 font-medium">Skill Gap (Missing)</span>
              </div>

              <div className="flex items-center gap-1.5 text-neutral-500">
                <div className="w-3 h-3 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <span className="text-[9px]">•</span>
                </div>
                <span>Not Required</span>
              </div>
            </div>
          </div>

          {/* Matrix Scrollable Container */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full border-collapse text-left text-xs min-w-[720px]">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60">
                  <th className="py-3 px-4 font-semibold text-neutral-300 sticky left-0 bg-neutral-950 z-10 w-64 min-w-[200px]">
                    Target Firm & Role
                  </th>
                  <th className="py-3 px-3 font-semibold text-center text-neutral-300 w-24">
                    Match Rate
                  </th>
                  {allRequiredSkills.map(skill => (
                    <th 
                      key={skill} 
                      className="py-3 px-2 font-semibold text-center text-neutral-400 whitespace-nowrap min-w-[100px]"
                      title={`Skill requirement: ${skill}`}
                    >
                      <span className="text-[11px] font-mono block max-w-[110px] truncate mx-auto">
                        {skill}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {filteredSchemes.map((scheme) => {
                  const score = schemeScores[scheme.id] || { total: 0, verified: 0, inProgress: 0, gaps: 0, matchPercent: 100, missingSkills: [] };
                  const schemeReqs = new Set((scheme.skills || []).map(s => s.trim().toLowerCase()));

                  return (
                    <tr key={scheme.id} className="hover:bg-neutral-800/30 transition-colors group">
                      
                      {/* Firm & Role details */}
                      <td className="py-3 px-4 sticky left-0 bg-neutral-900 z-10 group-hover:bg-neutral-850">
                        <div className="font-sans">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              {scheme.firm}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                              {scheme.sector}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate max-w-[210px] mt-0.5">
                            {scheme.roleTitle}
                          </p>
                        </div>
                      </td>

                      {/* Match Score Badge */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center justify-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            score.matchPercent >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            score.matchPercent >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {score.matchPercent}%
                          </span>
                          <span className="text-[9px] text-neutral-500 mt-0.5">
                            {score.verified}/{score.total} met
                          </span>
                        </div>
                      </td>

                      {/* Skill Heatmap Cells */}
                      {allRequiredSkills.map((skill) => {
                        const isRequired = schemeReqs.has(skill.toLowerCase());
                        
                        if (!isRequired) {
                          return (
                            <td key={skill} className="py-3 px-2 text-center text-neutral-700">
                              <span className="text-neutral-700 text-xs select-none">-</span>
                            </td>
                          );
                        }

                        const match = getSkillMatch(skill);

                        if (match.status === 'verified') {
                          return (
                            <td 
                              key={skill} 
                              className="py-3 px-2 text-center"
                              onMouseEnter={() => setHoveredCell({ firm: scheme.firm, skill })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-sm" title={`✓ Verified: ${match.userSkillTitle} (${match.proficiency})`}>
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            </td>
                          );
                        }

                        if (match.status === 'in_progress') {
                          return (
                            <td 
                              key={skill} 
                              className="py-3 px-2 text-center"
                              onMouseEnter={() => setHoveredCell({ firm: scheme.firm, skill })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400 shadow-sm" title={`⏳ Developing: ${match.userSkillTitle} (${match.proficiency})`}>
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                            </td>
                          );
                        }

                        // Skill Gap (Missing)
                        return (
                          <td 
                            key={skill} 
                            className="py-3 px-2 text-center"
                            onMouseEnter={() => setHoveredCell({ firm: scheme.firm, skill })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (onAddMissingSkill) {
                                  onAddMissingSkill(skill, SKILL_CATEGORY_MAP[skill] || 'Technical', 'Beginner');
                                }
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900 hover:border-rose-400 text-rose-400 transition-all cursor-pointer shadow-sm group/cell active:scale-95"
                              title={`⚠️ Missing keyword: ${skill}. Click to add to your skills list!`}
                            >
                              <Plus className="w-3.5 h-3.5 group-hover/cell:rotate-90 transition-transform" />
                            </button>
                          </td>
                        );

                      })}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Matrix Footer Guidance */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Click on any red <strong>+ cell</strong> to instantly add the required missing keyword to your tracker.</span>
            </span>
            <span className="font-mono text-neutral-500">
              {filteredSchemes.length} schemes evaluated
            </span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SCHEME CARDS BREAKDOWN */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme) => {
            const score = schemeScores[scheme.id] || { total: 0, verified: 0, inProgress: 0, gaps: 0, matchPercent: 100, missingSkills: [] };
            const reqs = scheme.skills || [];

            return (
              <div 
                key={scheme.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {scheme.sector}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">
                        {scheme.firm}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                        {scheme.roleTitle}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                        score.matchPercent >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        score.matchPercent >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {score.matchPercent}% Match
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                        {score.verified}/{score.total} skills met
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden mt-3 border border-neutral-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        score.matchPercent >= 80 ? 'bg-emerald-400' :
                        score.matchPercent >= 50 ? 'bg-amber-400' :
                        'bg-rose-400'
                      }`}
                      style={{ width: `${score.matchPercent}%` }}
                    />
                  </div>

                  {/* Skills Checklist Breakdown */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold block">
                      Target Competency Breakdown
                    </span>

                    <div className="space-y-1.5">
                      {reqs.map((sk) => {
                        const match = getSkillMatch(sk);
                        return (
                          <div 
                            key={sk}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${
                              match.status === 'verified' ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' :
                              match.status === 'in_progress' ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' :
                              'bg-rose-950/20 border-rose-900/40 text-rose-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {match.status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              {match.status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              {match.status === 'gap' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                              <span className="truncate font-medium">{sk}</span>
                            </div>

                            {match.status === 'gap' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onAddMissingSkill) {
                                    onAddMissingSkill(sk, SKILL_CATEGORY_MAP[sk] || 'Technical', 'Beginner');
                                  }
                                }}
                                className="px-2 py-0.5 rounded bg-rose-900/50 hover:bg-rose-800 text-[10px] font-bold text-rose-200 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                                {match.status === 'verified' ? 'Mastered' : 'In Progress'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Card Footer Notes */}
                {scheme.notes && (
                  <p className="text-[11px] text-neutral-500 italic line-clamp-2 pt-2 border-t border-neutral-800">
                    "{scheme.notes}"
                  </p>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
