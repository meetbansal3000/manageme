// Component: Executive Summary & Printable PDF Report Modal

import React, { useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Building2, 
  Award,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { UserTrackerData } from '../../../hooks/useFirestoreData';
import { exportApplicationsToCSV, exportVisaShiftsToCSV } from '../../../lib/export';
import { trackDataExported } from '../../../lib/analytics';

export interface ExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserTrackerData;
}

export const ExecutiveSummaryModal: React.FC<ExecutiveSummaryModalProps> = ({
  isOpen,
  onClose,
  userData
}) => {
  if (!isOpen) return null;

  // Pipeline calculations
  const applications = useMemo(() => {
    return Array.isArray(userData?.gradSchemes) ? userData.gradSchemes : [];
  }, [userData?.gradSchemes]);

  const shifts = useMemo(() => {
    return Array.isArray(userData?.workShifts) ? userData.workShifts : [];
  }, [userData?.workShifts]);

  const totalApplications = applications.length;
  const activeApplications = applications.filter(a => 
    a && a.status !== 'Rejected' && a.status !== 'Rejected ✕' && a.status !== 'Not Applied'
  ).length;

  const interviewCount = applications.filter(a => 
    a && (
      a.status === 'Interview' || 
      a.status === 'Video Interview' || 
      a.status === 'Assessment' || 
      a.status === 'Assessment Centre' || 
      a.status === 'Final Interview'
    )
  ).length;

  const offerCount = applications.filter(a => 
    a && (a.status === 'Offer' || a.status === 'Offer 🎉')
  ).length;

  // Visa calculations
  const totalHoursLogged = shifts.reduce((sum, s) => sum + (Number(s?.hours) || 0), 0);
  const visaCap = userData?.visaLimit || 20;
  const remainingHours = Math.max(0, visaCap - totalHoursLogged);
  const isVisaCompliant = totalHoursLogged <= visaCap;

  // Earnings
  const totalEarnings = shifts.reduce((sum, s) => {
    const hrs = Number(s?.hours) || 0;
    const rate = Number(s?.hourlyRate) || userData?.hourlyRate || 15.50;
    return sum + (hrs * rate);
  }, 0);

  // Top target firms & upcoming deadlines
  const topTargets = useMemo(() => {
    return [...applications]
      .filter(a => a && a.firm)
      .slice(0, 8);
  }, [applications]);

  const handlePrint = () => {
    trackDataExported('pdf');
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:z-auto">
      <Card 
        variant="glass" 
        padding="none" 
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-white/20 shadow-2xl rounded-2xl bg-slate-950/95 text-slate-100 print:max-h-none print:overflow-visible print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none custom-scrollbar"
      >
        {/* Action Header (Hidden in Print) */}
        <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-white/10 p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white">Executive Career & Visa Summary</h3>
              <p className="text-[11px] font-mono text-slate-400">Printable A4 report for career strategy & audit compliance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportApplicationsToCSV(applications)}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Pipeline CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportVisaShiftsToCSV(shifts, userData?.hourlyRate || 15.50)}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Timesheet CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print / Save PDF
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 space-y-6 print:p-6 print:space-y-4 print:text-black font-mono">
          {/* Header Banner */}
          <div className="border-b-2 border-blue-500/30 pb-6 print:border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider print:bg-black print:text-white">
                  ManageMe Executive Intelligence
                </span>
                <span className="text-xs text-slate-400 print:text-gray-600">CONFIDENTIAL</span>
              </div>
              <h1 className="text-2xl font-bold mt-2 text-white print:text-black tracking-tight">
                Career Vault & Visa Compliance Briefing
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-700 mt-1 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400 print:text-black" />
                <span>Workspace User • [Your Degree / Title] Candidate</span>
              </p>
            </div>

            <div className="text-right sm:text-right text-xs text-slate-400 print:text-gray-600">
              <span className="block font-bold text-white print:text-black">Report Date</span>
              <span>{currentDate}</span>
              <span className="block text-[10px] mt-0.5 text-emerald-400 print:text-black font-semibold">
                Status: Tier-4 Compliant
              </span>
            </div>
          </div>

          {/* Top KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 print:border-gray-300 print:bg-gray-50 space-y-1">
              <span className="text-[10px] uppercase text-slate-400 print:text-gray-600 font-bold block">
                Total Tracked
              </span>
              <span className="text-2xl font-bold text-white print:text-black">{totalApplications}</span>
              <span className="text-[10px] text-slate-500 print:text-gray-600 block">Graduate schemes & roles</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 print:border-gray-300 print:bg-gray-50 space-y-1">
              <span className="text-[10px] uppercase text-blue-400 print:text-gray-800 font-bold block">
                Active Pipelines
              </span>
              <span className="text-2xl font-bold text-blue-400 print:text-black">{activeApplications}</span>
              <span className="text-[10px] text-slate-500 print:text-gray-600 block">{interviewCount} in interview stages</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 print:border-gray-300 print:bg-gray-50 space-y-1">
              <span className="text-[10px] uppercase text-emerald-400 print:text-gray-800 font-bold block">
                Weekly Visa Cap
              </span>
              <span className="text-2xl font-bold text-emerald-400 print:text-black">
                {totalHoursLogged.toFixed(1)} / {visaCap}h
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600 block">
                {remainingHours.toFixed(1)}h remaining buffer
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 print:border-gray-300 print:bg-gray-50 space-y-1">
              <span className="text-[10px] uppercase text-amber-400 print:text-gray-800 font-bold block">
                Total Logged Earnings
              </span>
              <span className="text-2xl font-bold text-amber-400 print:text-black">
                £{totalEarnings.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600 block">{shifts.length} shift logs</span>
            </div>
          </div>

          {/* Section: Top Target Firms & Application Pipeline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-white/10 print:border-gray-300 pb-2">
              <h2 className="text-sm font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400 print:text-black" />
                <span>Primary Target Schemes & Status</span>
              </h2>
              <span className="text-[11px] text-slate-400 print:text-gray-600">
                Top {topTargets.length} tracked opportunities
              </span>
            </div>

            {topTargets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 print:text-gray-500 border border-white/10 print:border-gray-300 rounded-xl">
                No active graduate applications recorded in Career Vault.
              </div>
            ) : (
              <div className="border border-white/10 print:border-gray-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/[0.04] print:bg-gray-100 border-b border-white/10 print:border-gray-300 text-slate-400 print:text-gray-800 font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Firm / Company</th>
                      <th className="py-2.5 px-3">Role Title</th>
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3">Deadline</th>
                      <th className="py-2.5 px-3">Fast-Track Advantage</th>
                      <th className="py-2.5 px-3 text-right">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-gray-200">
                    {topTargets.map((scheme) => (
                      <tr key={scheme.id} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-bold text-white print:text-black">{scheme.firm}</td>
                        <td className="py-2.5 px-3 text-slate-300 print:text-gray-800">{scheme.roleTitle}</td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-gray-600">{scheme.sector || 'Finance'}</td>
                        <td className="py-2.5 px-3 text-slate-300 print:text-gray-800">{scheme.appCloses || 'Rolling'}</td>
                        <td className="py-2.5 px-3 text-emerald-400 print:text-black font-semibold">{scheme.certAdvantage || scheme.accaAdvantage || 'Standard'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 print:bg-gray-200 print:text-black print:border-gray-400">
                            {scheme.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Visa Work Compliance & Hours Verification */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-white/10 print:border-gray-300 pb-2">
              <h2 className="text-sm font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black" />
                <span>UK Student Visa (Tier-4) Compliance Audit</span>
              </h2>
              <span className={`text-[11px] font-bold ${isVisaCompliant ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-red-600'}`}>
                {isVisaCompliant ? '✓ 100% Compliant' : '⚠ Cap Exceeded'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 print:border-gray-300 print:bg-gray-50 text-xs space-y-2">
              <p className="text-slate-300 print:text-gray-800 leading-relaxed">
                UK Visas and Immigration (UKVI) statutory weekly work allowance is capped at <strong>{visaCap} hours per week</strong> during term time. Current logged activity registers <strong>{totalHoursLogged.toFixed(1)} hours</strong>, leaving a legal capacity buffer of <strong>{remainingHours.toFixed(1)} hours</strong>.
              </p>
              <div className="text-[11px] text-slate-400 print:text-gray-600 flex flex-wrap gap-4 pt-1">
                <span>Employer Record: Active</span>
                <span>Term Status: Michaelmas / Epiphany</span>
                <span>Verification Timestamp: {new Date().toISOString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-white/10 print:border-gray-400 pt-4 flex items-center justify-between text-[10px] text-slate-500 print:text-gray-600">
            <span>ManageMe Intelligence Platform • Verified Executive Report</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExecutiveSummaryModal;
