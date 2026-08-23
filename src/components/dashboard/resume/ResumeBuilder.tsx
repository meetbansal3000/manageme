// Component: ATS Resume Builder & Skills Vault Engine

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  Edit3, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  Layers,
  Star
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { toast } from '../../ui/Toast';

export interface ResumeData {
  header: {
    name: string;
    targetTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    githubOrPortfolio?: string;
  };
  summary: string;
  education: {
    id: string;
    institution: string;
    degree: string;
    dates: string;
    details: string[];
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    location: string;
    dates: string;
    bullets: string[];
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
  skills: {
    valuation: string[];
    accounting: string[];
    technical: string[];
  };
}

export type SkillLevel = 'Foundational' | 'Proficient' | 'Advanced';

export interface SkillItem {
  id: string;
  category: 'Valuation & Modeling' | 'Accounting & IFRS' | 'Data Analytics & Tech' | 'Financial Markets';
  name: string;
  level: SkillLevel;
  endorsements?: string;
}

const STORAGE_RESUME_KEY = 'manageme_resume_builder';
const STORAGE_SKILLS_KEY = 'manageme_skills_vault';

const DEFAULT_RESUME: ResumeData = {
  header: {
    name: 'Candidate Name',
    targetTitle: 'Investment Banking & Corporate Finance Analyst',
    email: 'candidate@durham.ac.uk',
    phone: '+44 (0) 7700 900123',
    location: 'Durham & London, United Kingdom',
    linkedin: 'linkedin.com/in/msc-finance-durham'
  },
  summary: 'MSc Finance & Investment student at Durham University and ACCA Affiliate with extensive practical experience in IFRS financial statement analysis, multi-stage DCF valuation modeling, and accounting automation. Proven record of building 3-statement integrated models and preparing audit workpapers for mid-market corporate clients.',
  education: [
    {
      id: 'edu_1',
      institution: 'Durham University',
      degree: 'MSc in Finance & Investment (Distinction Track)',
      dates: 'Sept 2025 – Present',
      details: [
        'Core Modules: Advanced Corporate Finance, Financial Reporting & Analysis, Applied Econometrics, Valuation.',
        'Dissertation / Project: Empirical valuation and cross-border M&A synergy pricing across European equities.'
      ]
    },
    {
      id: 'edu_2',
      institution: 'ACCA (Association of Chartered Certified Accountants)',
      degree: 'ACCA Affiliate Status (All Applied Knowledge, Skills & Strategic Professional Exams Completed)',
      dates: '2023 – 2025',
      details: [
        'Specialization: Strategic Business Reporting (SBR) & Advanced Financial Management (AFM).'
      ]
    }
  ],
  experience: [
    {
      id: 'exp_1',
      company: 'Chartered Accountants & Advisory Practice',
      role: 'IFRS Accounting Trainee & Corporate Advisory Analyst',
      location: 'London, UK',
      dates: 'June 2024 – August 2025',
      details: [],
      bullets: [
        'Constructed multi-stage Discounted Cash Flow (DCF), Comparable Company Analysis (CCA), and Precedent Transaction models to value private mid-market acquisition targets.',
        'Prepared IFRS-compliant financial statements, lease reconciliations (IFRS 16), and revenue recognition models (IFRS 15) for commercial clients with over £25M in annual turnover.',
        'Executed automated Xero accounting migrations and ledger reconciliations, improving month-end close speeds by 35%.'
      ]
    }
  ],
  certifications: [
    { id: 'cert_1', name: 'ACCA Affiliate', issuer: 'ACCA Global', date: '2025' },
    { id: 'cert_2', name: 'CFA Level 1 Candidate', issuer: 'CFA Institute', date: '2026' },
    { id: 'cert_3', name: 'Xero Certified Advisor', issuer: 'Xero UK', date: '2024' },
    { id: 'cert_4', name: 'Bloomberg Market Concepts (BMC)', issuer: 'Bloomberg LP', date: '2025' }
  ],
  skills: {
    valuation: ['DCF Modeling', 'LBO Analysis', 'Trading & Transaction Comps', 'WACC Analysis', 'Cap Table Management'],
    accounting: ['IFRS / UK GAAP', '3-Statement Financial Modeling', 'Working Capital Management', 'Xero Accounting', 'Audit Assurance'],
    technical: ['Financial Modeling in Excel (Advanced)', 'Python (pandas, numpy)', 'SQL Queries', 'Capital IQ', 'FactSet', 'Power BI']
  }
};

const DEFAULT_SKILLS_VAULT: SkillItem[] = [
  { id: 'sk_1', category: 'Valuation & Modeling', name: 'Discounted Cash Flow (DCF)', level: 'Advanced', endorsements: 'Durham MSc / CA Firm Models' },
  { id: 'sk_2', category: 'Valuation & Modeling', name: 'LBO Modeling & Returns', level: 'Proficient', endorsements: 'Coursework & Self-Directed' },
  { id: 'sk_3', category: 'Valuation & Modeling', name: 'Trading & Precedent Comps', level: 'Advanced', endorsements: 'Advisory Practice' },
  { id: 'sk_4', category: 'Accounting & IFRS', name: 'IFRS 16 (Lease Accounting)', level: 'Advanced', endorsements: 'ACCA SBR Exam' },
  { id: 'sk_5', category: 'Accounting & IFRS', name: 'Xero Accounting Software', level: 'Advanced', endorsements: 'Xero Certified Advisor' },
  { id: 'sk_6', category: 'Accounting & IFRS', name: 'Working Capital Optimization', level: 'Proficient', endorsements: 'CA Firm Trainee' },
  { id: 'sk_7', category: 'Data Analytics & Tech', name: 'Advanced Excel & Financial Modeling', level: 'Advanced', endorsements: 'Wall St Prep / Daily Usage' },
  { id: 'sk_8', category: 'Data Analytics & Tech', name: 'Python Financial Analytics (pandas)', level: 'Proficient', endorsements: 'Durham Econometrics' },
  { id: 'sk_9', category: 'Data Analytics & Tech', name: 'SQL Querying & Data Extraction', level: 'Proficient', endorsements: 'Database Projects' },
  { id: 'sk_10', category: 'Financial Markets', name: 'CFA Level 1 Curriculum', level: 'Proficient', endorsements: 'CFA Candidate' },
  { id: 'sk_11', category: 'Financial Markets', name: 'Bloomberg Terminal / BMC', level: 'Proficient', endorsements: 'Bloomberg Certified' }
];

export const ResumeBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'skills'>('builder');

  // Resume Data
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RESUME_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_RESUME;
  });

  // Skills Vault Data
  const [skillsVault, setSkillsVault] = useState<SkillItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SKILLS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SKILLS_VAULT;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(resumeData));
    } catch {}
  }, [resumeData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SKILLS_KEY, JSON.stringify(skillsVault));
    } catch {}
  }, [skillsVault]);

  // Form Section Control
  const [activeFormSection, setActiveFormSection] = useState<'header' | 'education' | 'experience' | 'certifications' | 'skills'>('header');

  // New Skill Modal
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<SkillItem>>({
    name: '',
    category: 'Valuation & Modeling',
    level: 'Proficient',
    endorsements: ''
  });

  const handlePrintResume = () => {
    window.print();
    toast.success('Triggered PDF print preview for ATS Resume.');
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name) return;

    const item: SkillItem = {
      id: `skill_${Date.now()}`,
      name: newSkill.name,
      category: (newSkill.category as any) || 'Valuation & Modeling',
      level: (newSkill.level as SkillLevel) || 'Proficient',
      endorsements: newSkill.endorsements || 'Verified'
    };

    setSkillsVault([...skillsVault, item]);
    toast.success(`Added ${item.name} (${item.level}) to Skills Vault`);
    setIsAddSkillOpen(false);
    setNewSkill({ name: '', category: 'Valuation & Modeling', level: 'Proficient', endorsements: '' });
  };

  const handleCycleSkillLevel = (id: string) => {
    const levels: SkillLevel[] = ['Foundational', 'Proficient', 'Advanced'];
    const updated = skillsVault.map(s => {
      if (s.id === id) {
        const nextIdx = (levels.indexOf(s.level) + 1) % levels.length;
        const nextLevel = levels[nextIdx];
        toast.info(`Updated ${s.name} to ${nextLevel}`);
        return { ...s, level: nextLevel };
      }
      return s;
    });
    setSkillsVault(updated);
  };

  const handleDeleteSkill = (id: string) => {
    setSkillsVault(skillsVault.filter(s => s.id !== id));
    toast.info('Skill removed');
  };

  return (
    <div className="space-y-6">
      {/* Print Styles for Single Page ATS PDF */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ats-resume-document, #ats-resume-document * {
            visibility: visible !important;
          }
          #ats-resume-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 20mm !important;
            margin: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 10pt !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>ATS Resume Builder & Skills Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard single-page investment banking ATS resume template & tier-based competency matrix.
          </p>
        </div>

        {/* View Switcher & Print Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'builder' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              1-Page ATS Resume
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'skills' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 inline mr-1.5 text-amber-300" />
              Skills Matrix
            </button>
          </div>

          {activeTab === 'builder' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintResume}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Export to PDF
            </Button>
          )}
        </div>
      </div>

      {/* VIEW 1: ATS RESUME BUILDER & LIVE PREVIEW */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Editor Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card variant="glass" padding="md" className="border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Resume Editor</span>
                </h3>

                {/* Section Quick Toggle */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {(['header', 'education', 'experience', 'skills'] as const).map(sec => (
                    <button
                      key={sec}
                      onClick={() => setActiveFormSection(sec)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        activeFormSection === sec ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Section: Header */}
              {activeFormSection === 'header' && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Full Name</label>
                    <Input
                      value={resumeData.header.name}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        header: { ...resumeData.header, name: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Target Role Headline</label>
                    <Input
                      value={resumeData.header.targetTitle}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        header: { ...resumeData.header, targetTitle: e.target.value }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Email</label>
                      <Input
                        value={resumeData.header.email}
                        onChange={(e) => setResumeData({
                          ...resumeData,
                          header: { ...resumeData.header, email: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Phone</label>
                      <Input
                        value={resumeData.header.phone}
                        onChange={(e) => setResumeData({
                          ...resumeData,
                          header: { ...resumeData.header, phone: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Location</label>
                    <Input
                      value={resumeData.header.location}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        header: { ...resumeData.header, location: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Executive Summary</label>
                    <textarea
                      rows={4}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Section: Education */}
              {activeFormSection === 'education' && (
                <div className="space-y-4 font-mono text-xs">
                  {resumeData.education.map((edu, idx) => (
                    <div key={edu.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-blue-400">Education #{idx + 1}</span>
                      </div>
                      <Input
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].institution = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                      />
                      <Input
                        placeholder="Degree & Grade"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].degree = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                      />
                      <Input
                        placeholder="Dates"
                        value={edu.dates}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].dates = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Form Section: Experience */}
              {activeFormSection === 'experience' && (
                <div className="space-y-4 font-mono text-xs">
                  {resumeData.experience.map((exp, idx) => (
                    <div key={exp.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-400">Experience #{idx + 1}</span>
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[idx].company = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                      />
                      <Input
                        placeholder="Role / Title"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[idx].role = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                      />
                      <div className="space-y-1 mt-2">
                        <span className="text-[10px] text-slate-400 block font-semibold">Key Bullet Points:</span>
                        {exp.bullets.map((bullet, bIdx) => (
                          <textarea
                            key={bIdx}
                            rows={2}
                            value={bullet}
                            onChange={(e) => {
                              const updated = [...resumeData.experience];
                              updated[idx].bullets[bIdx] = e.target.value;
                              setResumeData({ ...resumeData, experience: updated });
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[11px] font-mono text-white focus:outline-none focus:border-blue-500 resize-none"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Section: Skills */}
              {activeFormSection === 'skills' && (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Valuation & Modeling Skills (comma-separated)</label>
                    <Input
                      value={resumeData.skills.valuation.join(', ')}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, valuation: e.target.value.split(',').map(s => s.trim()) }
                      })}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Accounting & Reporting (comma-separated)</label>
                    <Input
                      value={resumeData.skills.accounting.join(', ')}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, accounting: e.target.value.split(',').map(s => s.trim()) }
                      })}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Technical & Software (comma-separated)</label>
                    <Input
                      value={resumeData.skills.technical.join(', ')}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, technical: e.target.value.split(',').map(s => s.trim()) }
                      })}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Live ATS Document Preview (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>Standard 1-Page ATS Format (Harvard/Wharton Layout)</span>
              <span className="text-emerald-400">● Live Auto-Sync</span>
            </div>

            {/* ATS Document Container */}
            <div
              id="ats-resume-document"
              className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-2xl font-serif text-[13px] leading-relaxed border border-slate-200 select-text"
              style={{ fontFamily: '"Georgia", "Times New Roman", serif', minHeight: '850px' }}
            >
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-2xl font-bold uppercase tracking-wider text-black font-sans">
                  {resumeData.header.name}
                </h1>
                <p className="text-xs text-slate-700 mt-1 font-sans font-semibold">
                  {resumeData.header.targetTitle}
                </p>
                <p className="text-[11px] text-slate-600 mt-1 font-sans">
                  {resumeData.header.location} • {resumeData.header.phone} • {resumeData.header.email} • {resumeData.header.linkedin}
                </p>
              </div>

              {/* Executive Summary */}
              <div className="mb-4">
                <p className="text-[11.5px] text-slate-800 text-justify leading-normal">
                  {resumeData.summary}
                </p>
              </div>

              {/* Education Section */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase font-sans tracking-wider border-b border-black pb-0.5 mb-2 text-black">
                  Education & Professional Accreditations
                </h2>
                <div className="space-y-2">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900 font-sans">
                        <span>{edu.institution}</span>
                        <span className="font-normal text-slate-700">{edu.dates}</span>
                      </div>
                      <div className="italic text-slate-800">{edu.degree}</div>
                      {edu.details.map((d, i) => (
                        <div key={i} className="text-[11px] text-slate-700 pl-3 relative before:content-['•'] before:absolute before:left-0">
                          {d}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Experience Section */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase font-sans tracking-wider border-b border-black pb-0.5 mb-2 text-black">
                  Professional Experience
                </h2>
                <div className="space-y-3">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900 font-sans">
                        <span>{exp.company}</span>
                        <span className="font-normal text-slate-700">{exp.dates}</span>
                      </div>
                      <div className="italic text-slate-800 mb-1">{exp.role} — {exp.location}</div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-[11px] text-slate-800 leading-normal">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Section */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase font-sans tracking-wider border-b border-black pb-0.5 mb-2 text-black">
                  Certifications & Professional Credentials
                </h2>
                <div className="grid grid-cols-2 gap-1 text-[11.5px] text-slate-800">
                  {resumeData.certifications.map((c) => (
                    <div key={c.id}>
                      <strong>{c.name}</strong> ({c.issuer}, {c.date})
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Skills Section */}
              <div>
                <h2 className="text-xs font-bold uppercase font-sans tracking-wider border-b border-black pb-0.5 mb-2 text-black">
                  Technical Skills & Competencies
                </h2>
                <div className="text-[11px] text-slate-800 space-y-1">
                  <div>
                    <strong>Financial Valuation & Modeling:</strong> {resumeData.skills.valuation.join(', ')}
                  </div>
                  <div>
                    <strong>Accounting Standards & Reporting:</strong> {resumeData.skills.accounting.join(', ')}
                  </div>
                  <div>
                    <strong>Data Analytics, Code & Systems:</strong> {resumeData.skills.technical.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SKILLS MATRIX & TIER VAULT */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-mono text-white uppercase">
                Tier-Based Competency Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any skill badge to cycle proficiency level (Foundational → Proficient → Advanced).
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddSkillOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              + Add Skill
            </Button>
          </div>

          {/* Grid of Skill Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['Valuation & Modeling', 'Accounting & IFRS', 'Data Analytics & Tech', 'Financial Markets'] as const).map(cat => {
              const catSkills = skillsVault.filter(s => s.category === cat);

              return (
                <Card key={cat} variant="glass" padding="md" className="border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold font-mono text-white uppercase">{cat}</span>
                    <span className="text-[10px] font-mono text-slate-400">{catSkills.length} competencies</span>
                  </div>

                  <div className="space-y-2">
                    {catSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <div>
                          <span className="text-xs font-mono font-semibold text-white block">{skill.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{skill.endorsements || 'Verified'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCycleSkillLevel(skill.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                              skill.level === 'Advanced'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : skill.level === 'Proficient'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                            title="Click to cycle level"
                          >
                            {skill.level}
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                            title="Delete skill"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {catSkills.length === 0 && (
                      <div className="text-center py-4 text-[11px] font-mono text-slate-600">
                        No skills in this category yet.
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD SKILL MODAL */}
      {isAddSkillOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" padding="lg" className="w-full max-w-md border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold font-mono text-white uppercase mb-4">
              Add Verified Skill / Competency
            </h3>

            <form onSubmit={handleAddSkill} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Skill Name *</label>
                <Input
                  required
                  placeholder="e.g. M&A Accretion / Dilution"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Valuation & Modeling" className="bg-slate-900">Valuation & Modeling</option>
                  <option value="Accounting & IFRS" className="bg-slate-900">Accounting & IFRS</option>
                  <option value="Data Analytics & Tech" className="bg-slate-900">Data Analytics & Tech</option>
                  <option value="Financial Markets" className="bg-slate-900">Financial Markets</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Proficiency Level</label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as SkillLevel })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Foundational" className="bg-slate-900">Foundational (Bronze)</option>
                  <option value="Proficient" className="bg-slate-900">Proficient (Silver / Blue)</option>
                  <option value="Advanced" className="bg-slate-900">Advanced / Expert (Gold / Emerald)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Evidence / Endorsements</label>
                <Input
                  placeholder="e.g. Durham Coursework or ACCA Exam"
                  value={newSkill.endorsements}
                  onChange={(e) => setNewSkill({ ...newSkill, endorsements: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddSkillOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Competency
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
