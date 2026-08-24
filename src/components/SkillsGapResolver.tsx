import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Target, 
  Building2, 
  HelpCircle, 
  X, 
  Check, 
  Flame, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap
} from 'lucide-react';
import { GraduateScheme, SkillTask, CourseCertification, SkillProficiency } from '../types';
import { GRADUATE_SCHEMES_DATA } from '../data/trackerData';

export interface RecommendedSkillGap {
  keyword: string;
  category: string;
  demandedByFirms: string[];
  firmCount: number;
  sectors: string[];
  impactScore: number; // e.g. 100 max
  rationale: string;
  suggestedAction: string;
  recommendedProficiency: SkillProficiency;
  estimatedHours: string;
  urgency: 'High' | 'Medium' | 'Low';
  learningResource?: string;
}

interface SkillsGapResolverProps {
  skills: SkillTask[];
  courses?: CourseCertification[];
  gradSchemes?: GraduateScheme[];
  onAddSkill: (skill: Partial<SkillTask>) => void;
  onAddMultipleSkills?: (skillsList: Partial<SkillTask>[]) => void;
  onClose?: () => void;
  isOpenModal?: boolean;
}

// Category & context mapping
const SKILL_METADATA_MAP: Record<string, { 
  category: string; 
  rationale: string; 
  suggestedAction: string; 
  hours: string; 
  resource: string;
  defaultProficiency: SkillProficiency;
}> = {
  'Asset Allocation': {
    category: 'Quantitative',
    rationale: 'Core requirement for Buy-side Portfolio Management, Multi-Asset, and Wealth divisions.',
    suggestedAction: 'Add to curriculum: Study Mean-Variance Optimization, Black-Litterman, and Risk Parity.',
    hours: '15 hrs',
    resource: 'CFA Level 1 Portfolio Management & Python backtesting',
    defaultProficiency: 'Intermediate'
  },
  'Aladdin': {
    category: 'Technical',
    rationale: 'BlackRock’s proprietary risk & portfolio operating system; essential differentiator for Aladdin Client Services.',
    suggestedAction: 'Review BlackRock Aladdin whitepapers, portfolio analytics workflow, and enterprise risk framing.',
    hours: '10 hrs',
    resource: 'BlackRock Aladdin Academy & Enterprise Risk Case Studies',
    defaultProficiency: 'Beginner'
  },
  'Python': {
    category: 'Quantitative',
    rationale: 'Demanded across Quantitative Research, Risk Analytics, and Automated Trading desks.',
    suggestedAction: 'Build automated data pipelines for financial statement parsing using Pandas, NumPy, and yfinance.',
    hours: '25 hrs',
    resource: 'Advanced Financial Computing & Python for Finance Masterclass',
    defaultProficiency: 'Intermediate'
  },
  'Financial Modeling': {
    category: 'Technical',
    rationale: 'Baseline technical hurdle tested across all Investment Banking, Private Equity, and Equity Research interviews.',
    suggestedAction: 'Build dynamic 3-statement models from 10-Ks with integrated debt schedules and scenario toggles.',
    hours: '30 hrs',
    resource: 'Outskill / CFI 3-Statement & DCF Modeling Certification',
    defaultProficiency: 'Advanced'
  },
  'Valuation': {
    category: 'Technical',
    rationale: 'Tested in M&A technical tests (Trading Comps, Transaction Comps, DCF, and LBO bounds).',
    suggestedAction: 'Calculate Enterprise Value adjustments, WACC, and multi-stage Gordon Growth vs. Exit Multiple terminal values.',
    hours: '20 hrs',
    resource: 'Damodaran Valuation Lectures & Outskill M&A Masterclass',
    defaultProficiency: 'Advanced'
  },
  'DCF': {
    category: 'Technical',
    rationale: 'Standard valuation method expected in technical interviews at Lazard, Rothschild, and Evercore.',
    suggestedAction: 'Model Unlevered Free Cash Flows, calculate stub periods, and build sensitivity matrix tables.',
    hours: '12 hrs',
    resource: 'CFI DCF Valuation Modeling Course',
    defaultProficiency: 'Advanced'
  },
  'LBO': {
    category: 'Technical',
    rationale: 'Critical for Private Equity and Leveraged Finance interview case studies.',
    suggestedAction: 'Practice building a paper LBO in under 15 minutes (IRR tables, MoIC, debt paydown waterfall).',
    hours: '18 hrs',
    resource: 'Wall Street Prep Paper LBO & Private Equity Modeling',
    defaultProficiency: 'Intermediate'
  },
  'Fixed Income': {
    category: 'Domain Knowledge',
    rationale: 'Crucial for Debt Capital Markets, Credit Trading, and Asset Management fixed income teams.',
    suggestedAction: 'Master duration, convexity, yield curve inversion dynamics, and credit spread mechanics.',
    hours: '15 hrs',
    resource: 'CFA Level 1 Fixed Income Modules & Bloomberg BMC',
    defaultProficiency: 'Intermediate'
  },
  'Equity Research': {
    category: 'Domain Knowledge',
    rationale: 'Required for Buy-Side Research, Long/Short Equity hedge funds, and Sell-side Equity desks.',
    suggestedAction: 'Draft a 2-page initiation report on a UK FTSE 100 stock with investment thesis and risk catalysts.',
    hours: '20 hrs',
    resource: 'Institutional Equity Analysis & Bloomberg Terminal Lab',
    defaultProficiency: 'Intermediate'
  },
  'M&A Advisory': {
    category: 'Domain Knowledge',
    rationale: 'Core domain for Investment Banking Analyst programs (Lazard, Rothschild, Goldman Sachs).',
    suggestedAction: 'Study accretion/dilution analysis, synergies valuation, and structural takeover codes (UK Takeover Panel).',
    hours: '18 hrs',
    resource: 'Corporate Finance Institute (CFI) M&A Advisory Certification',
    defaultProficiency: 'Intermediate'
  },
  'Financial Reporting / IFRS': {
    category: 'Accounting',
    rationale: 'Key differentiator for Audit, Financial Analysis, and UK Corporate Finance positions.',
    suggestedAction: 'Complete advanced reporting modules covering asset valuation, revenue recognition, and lease accounting.',
    hours: '40 hrs',
    resource: 'Financial Reporting & Accounting Standards Certification',
    defaultProficiency: 'Advanced'
  },
  'Xero': {
    category: 'Accounting',
    rationale: 'Practical cloud accounting competency requested by Big 4 & Mid-tier audit advisory practices.',
    suggestedAction: 'Complete the official Xero Advisor Certification (free online).',
    hours: '6 hrs',
    resource: 'Official Xero Advisor Certification Portal',
    defaultProficiency: 'Beginner'
  },
  'Power BI': {
    category: 'Analytics',
    rationale: 'Sought-after business intelligence and financial reporting tool across consulting and corporate finance.',
    suggestedAction: 'Build an interactive dashboard connecting Excel trial balances to DAX measure cards.',
    hours: '12 hrs',
    resource: 'Microsoft Learn Power BI Data Analyst & Maven Analytics',
    defaultProficiency: 'Intermediate'
  },
  'ESG': {
    category: 'Domain Knowledge',
    rationale: 'Heavily emphasized in BlackRock, Schroders, and European asset managers (SFDR Article 8/9).',
    suggestedAction: 'Understand Scope 1/2/3 carbon accounting and ESG score integration into portfolio weights.',
    hours: '10 hrs',
    resource: 'CFA Institute Certificate in ESG Investing & Coursera Wharton ESG',
    defaultProficiency: 'Beginner'
  },
  'Private Credit': {
    category: 'Domain Knowledge',
    rationale: 'Rapidly growing alternative asset class in London (direct lending, mezzanine, unitranche).',
    suggestedAction: 'Study loan covenants, leverage multiples (Debt/EBITDA), and base rate floating spreads (SONIA/SOFR).',
    hours: '12 hrs',
    resource: 'Alternative Investments & S&P Global Credit Ratings',
    defaultProficiency: 'Intermediate'
  },
  'Real Estate PE': {
    category: 'Domain Knowledge',
    rationale: 'Demanded by Real Estate Investment Trusts and opportunistic property funds.',
    suggestedAction: 'Learn unlevered vs levered property cash flow waterfalls, Cap Rates, and Net Initial Yield.',
    hours: '15 hrs',
    resource: 'ULI / ARGUS Real Estate Modeling',
    defaultProficiency: 'Beginner'
  },
  'Restructuring': {
    category: 'Domain Knowledge',
    rationale: 'Essential for Special Situations and Turnaround Advisory practices.',
    suggestedAction: 'Study 13-week cash flow forecasts, Chapter 11 / UK Scheme of Arrangement, and debt restructuring.',
    hours: '16 hrs',
    resource: 'Insolvency Practitioners Association & Turnaround Management Association',
    defaultProficiency: 'Intermediate'
  }
};

export const SkillsGapResolver: React.FC<SkillsGapResolverProps> = ({
  skills = [],
  courses = [],
  gradSchemes,
  onAddSkill,
  onAddMultipleSkills,
  onClose,
  isOpenModal = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');
  const [resolvedKeywords, setResolvedKeywords] = useState<Set<string>>(new Set());
  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set());
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [lastAddedCount, setLastAddedCount] = useState(0);

  const schemesList: GraduateScheme[] = useMemo(() => {
    if (gradSchemes && gradSchemes.length > 0) return gradSchemes;
    return [];
  }, [gradSchemes]);

  // Normalized user skill map
  const userSkillMap = useMemo(() => {
    const map = new Map<string, { status: string; originalName: string }>();

    skills.forEach(s => {
      const lower = s.name.toLowerCase();
      map.set(lower, { status: s.status, originalName: s.name });
    });

    courses.forEach(c => {
      if (c.skillsAcquired && Array.isArray(c.skillsAcquired)) {
        c.skillsAcquired.forEach(sk => {
          const lower = sk.toLowerCase();
          if (!map.has(lower)) {
            map.set(lower, { status: c.status === 'Completed' ? 'Done' : 'In Progress', originalName: sk });
          }
        });
      }
    });

    return map;
  }, [skills, courses]);

  // Fuzzy check for existing skills
  const isSkillCovered = (keyword: string): boolean => {
    const reqLower = keyword.toLowerCase();
    if (userSkillMap.has(reqLower)) return true;

    for (const [userSkillLower] of userSkillMap.entries()) {
      if (userSkillLower.includes(reqLower) || reqLower.includes(userSkillLower)) return true;
      if (reqLower === 'dcf' && userSkillLower.includes('dcf')) return true;
      if (reqLower.includes('ifrs') && userSkillLower.includes('ifrs')) return true;
      if (reqLower.includes('3-statement') && userSkillLower.includes('3-statement')) return true;
    }
    return false;
  };

  // Scan graduate schemes to extract missing requirements and generate recommendations
  const recommendedGaps: RecommendedSkillGap[] = useMemo(() => {
    const keywordMap = new Map<string, { demandedByFirms: Set<string>; sectors: Set<string> }>();

    schemesList.forEach(scheme => {
      const reqs = scheme.skills || [];
      reqs.forEach(sk => {
        const trimmed = sk.trim();
        if (!isSkillCovered(trimmed)) {
          const existing = keywordMap.get(trimmed) || { demandedByFirms: new Set(), sectors: new Set() };
          existing.demandedByFirms.add(scheme.firm);
          if (scheme.sector) existing.sectors.add(scheme.sector);
          keywordMap.set(trimmed, existing);
        }
      });
    });

    const list: RecommendedSkillGap[] = [];

    keywordMap.forEach((data, keyword) => {
      const firmCount = data.demandedByFirms.size;
      const meta = SKILL_METADATA_MAP[keyword] || {
        category: 'Technical',
        rationale: `Direct requirement benchmarked across ${firmCount} target graduate schemes.`,
        suggestedAction: `Develop verified foundational competence in ${keyword} to pass recruiter screening.`,
        hours: '15 hrs',
        resource: 'Core Academic Modules & Financial Modeling Library',
        defaultProficiency: 'Intermediate' as SkillProficiency
      };

      const impactScore = Math.min(100, Math.round((firmCount / Math.max(1, schemesList.length)) * 100) + (meta.defaultProficiency === 'Advanced' ? 20 : 10));
      const urgency: 'High' | 'Medium' | 'Low' = firmCount >= 2 || impactScore >= 50 ? 'High' : firmCount === 1 && meta.defaultProficiency === 'Advanced' ? 'Medium' : 'Low';

      list.push({
        keyword,
        category: meta.category,
        demandedByFirms: Array.from(data.demandedByFirms),
        firmCount,
        sectors: Array.from(data.sectors),
        impactScore,
        rationale: meta.rationale,
        suggestedAction: meta.suggestedAction,
        recommendedProficiency: meta.defaultProficiency,
        estimatedHours: meta.hours,
        urgency,
        learningResource: meta.resource
      });
    });

    // Sort by impact score descending
    return list.sort((a, b) => b.impactScore - a.impactScore);
  }, [schemesList, userSkillMap]);

  // Filter recommendations
  const filteredGaps = useMemo(() => {
    return recommendedGaps.filter(gap => {
      const matchesCategory = selectedCategory === 'All' || gap.category === selectedCategory;
      const matchesUrgency = selectedUrgency === 'All' || gap.urgency === selectedUrgency;
      return matchesCategory && matchesUrgency;
    });
  }, [recommendedGaps, selectedCategory, selectedUrgency]);

  // Handler to add a single resolved gap
  const handleResolveSingle = (gap: RecommendedSkillGap) => {
    const newSkill: Partial<SkillTask> = {
      id: `sk-gap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: gap.keyword,
      category: gap.category,
      proficiency: gap.recommendedProficiency,
      rating: gap.recommendedProficiency === 'Beginner' ? 1 : gap.recommendedProficiency === 'Advanced' ? 4 : 3,
      priority: gap.urgency === 'High' ? 1 : 2,
      status: 'Not Started',
      reason: `Automated Gap Resolver: Required by ${gap.demandedByFirms.join(', ')} (${gap.rationale})`,
      keyBenefit: `Closes keyword recruitment criteria for ${gap.sectors.join(' & ')} schemes`,
      timeToComplete: gap.estimatedHours,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    onAddSkill(newSkill);
    setResolvedKeywords(prev => new Set(prev).add(gap.keyword));
    setSelectedForBatch(prev => {
      const next = new Set(prev);
      next.delete(gap.keyword);
      return next;
    });

    setLastAddedCount(1);
    setShowSuccessBanner(true);
    setTimeout(() => setShowSuccessBanner(false), 4000);
  };

  // Handler to batch add all selected or all filtered gaps
  const handleResolveBatch = (gapsToResolve: RecommendedSkillGap[]) => {
    if (gapsToResolve.length === 0) return;

    const newSkillsList: Partial<SkillTask>[] = gapsToResolve.map((gap, index) => ({
      id: `sk-gap-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      name: gap.keyword,
      category: gap.category,
      proficiency: gap.recommendedProficiency,
      rating: gap.recommendedProficiency === 'Beginner' ? 1 : gap.recommendedProficiency === 'Advanced' ? 4 : 3,
      priority: gap.urgency === 'High' ? 1 : 2,
      status: 'Not Started',
      reason: `Automated Gap Resolver: Required by ${gap.demandedByFirms.join(', ')} (${gap.rationale})`,
      keyBenefit: `Closes recruitment criteria for ${gap.sectors.join(' & ')} schemes`,
      timeToComplete: gap.estimatedHours,
      targetDate: new Date(Date.now() + (30 + index * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    if (onAddMultipleSkills) {
      onAddMultipleSkills(newSkillsList);
    } else {
      newSkillsList.forEach(s => onAddSkill(s));
    }

    const newResolved = new Set(resolvedKeywords);
    gapsToResolve.forEach(g => newResolved.add(g.keyword));
    setResolvedKeywords(newResolved);
    setSelectedForBatch(new Set());

    setLastAddedCount(gapsToResolve.length);
    setShowSuccessBanner(true);
    setTimeout(() => setShowSuccessBanner(false), 4000);
  };

  const toggleSelectForBatch = (keyword: string) => {
    setSelectedForBatch(prev => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const unadded = filteredGaps.filter(g => !resolvedKeywords.has(g.keyword));
    if (selectedForBatch.size === unadded.length) {
      setSelectedForBatch(new Set());
    } else {
      setSelectedForBatch(new Set(unadded.map(g => g.keyword)));
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    recommendedGaps.forEach(g => set.add(g.category));
    return ['All', ...Array.from(set)];
  }, [recommendedGaps]);

  const content = (
    <div id="skillsGapResolverContainer" className="space-y-5">
      
      {/* Top Banner with Scanner Summary */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Automated Skills Gap Resolver
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  Graduate Scheme Scanner
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Continuously audits your graduate scheme targets (BlackRock, Lazard, Schroders, Deloitte) to extract and queue missing requirements into your learning plan.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors self-end sm:self-auto cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Diagnostics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">Schemes Scanned</span>
              <div className="text-xl font-bold font-space-mono text-white mt-0.5">
                {schemesList.length} <span className="text-xs text-neutral-500 font-normal">programs</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">Identified Gaps</span>
              <div className="text-xl font-bold font-space-mono text-rose-400 mt-0.5">
                {recommendedGaps.length} <span className="text-xs text-neutral-500 font-normal">keywords</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">High Priority</span>
              <div className="text-xl font-bold font-space-mono text-amber-400 mt-0.5">
                {recommendedGaps.filter(g => g.urgency === 'High').length} <span className="text-xs text-neutral-500 font-normal">critical</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">Resolved / Added</span>
              <div className="text-xl font-bold font-space-mono text-emerald-400 mt-0.5">
                {resolvedKeywords.size} <span className="text-xs text-neutral-500 font-normal">in tracker</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* Batch Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Filter by:</span>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            {/* Urgency Filter */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔥 High Priority Only</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors cursor-pointer"
            >
              {selectedForBatch.size === filteredGaps.filter(g => !resolvedKeywords.has(g.keyword)).length && selectedForBatch.size > 0
                ? 'Deselect All'
                : 'Select All Filtered'}
            </button>

            {selectedForBatch.size > 0 ? (
              <button
                type="button"
                id="resolveBatchSelectedBtn"
                onClick={() => {
                  const toAdd = recommendedGaps.filter(g => selectedForBatch.has(g.keyword));
                  handleResolveBatch(toAdd);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add {selectedForBatch.size} Selected to Skills</span>
              </button>
            ) : (
              <button
                type="button"
                id="resolveAllHighPriorityBtn"
                onClick={() => {
                  const unaddedHigh = recommendedGaps.filter(g => g.urgency === 'High' && !resolvedKeywords.has(g.keyword));
                  handleResolveBatch(unaddedHigh.length > 0 ? unaddedHigh : recommendedGaps.filter(g => !resolvedKeywords.has(g.keyword)));
                }}
                disabled={recommendedGaps.filter(g => !resolvedKeywords.has(g.keyword)).length === 0}
                className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Queue All High-Impact Gaps ({recommendedGaps.filter(g => g.urgency === 'High' && !resolvedKeywords.has(g.keyword)).length})</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Success Notification Banner */}
      {showSuccessBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Successfully added <strong>{lastAddedCount} {lastAddedCount === 1 ? 'skill' : 'skills'}</strong> to your "Recommended to Learn" list and active Skills Matrix!</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-900 px-2 py-0.5 rounded text-emerald-300">
            Synced
          </span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGaps.map((gap) => {
          const isResolved = resolvedKeywords.has(gap.keyword);
          const isSelected = selectedForBatch.has(gap.keyword);

          return (
            <div
              key={gap.keyword}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                isResolved
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                  : isSelected
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-lg'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 shadow-md'
              }`}
            >
              <div>
                {/* Header with Urgency & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {!isResolved && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectForBatch(gap.keyword)}
                        className="w-4 h-4 rounded border-neutral-700 text-amber-500 focus:ring-amber-500 bg-neutral-950 cursor-pointer"
                        title="Select for batch resolution"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white">
                          {gap.keyword}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {gap.category}
                        </span>
                        {gap.urgency === 'High' && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400" /> High Demand
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-amber-400 font-bold block">
                      {gap.impactScore}% Match Boost
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {gap.firmCount} {gap.firmCount === 1 ? 'firm' : 'firms'}
                    </span>
                  </div>
                </div>

                {/* Target Demanding Firms Chips */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-400 font-mono uppercase font-semibold">Demanded By:</span>
                  {gap.demandedByFirms.map(firm => (
                    <span 
                      key={firm}
                      className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px] font-medium"
                    >
                      {firm}
                    </span>
                  ))}
                </div>

                {/* Rationale & Suggested Action */}
                <div className="mt-3 space-y-2 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs">
                  <div className="text-neutral-300 leading-relaxed">
                    <span className="text-amber-400/90 font-semibold font-mono text-[10px] uppercase block mb-0.5">Why Recruiters Care</span>
                    {gap.rationale}
                  </div>
                  
                  <div className="text-neutral-400 text-[11px] border-t border-neutral-800/80 pt-2 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Action Plan:</strong> {gap.suggestedAction}</span>
                  </div>
                </div>

                {/* Learning Details Bar */}
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" /> Est: <strong>{gap.estimatedHours}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-neutral-500" /> Target: <strong>{gap.recommendedProficiency}</strong>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 truncate max-w-[200px]" title={gap.learningResource}>
                  📚 {gap.learningResource}
                </span>

                {isResolved ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" /> Added to Matrix
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleResolveSingle(gap)}
                    id={`resolveBtn-${gap.keyword.replace(/\s+/g, '-').toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add to Learning List</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {filteredGaps.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
            <h4 className="text-base font-bold text-white">All Graduate Scheme Skills Resolved!</h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Your Skills Matrix covers all required criteria extracted from your target schemes. You are fully positioned for technical screening rounds.
            </p>
          </div>
        )}
      </div>

    </div>
  );

  if (isOpenModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      >
        <div className="w-full max-w-4xl glass-panel border border-neutral-800 rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
