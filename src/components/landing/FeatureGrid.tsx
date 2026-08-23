// Component: Landing Page Feature Grid & Architectural Showcase

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Briefcase, 
  BookOpen, 
  DollarSign, 
  Sparkles, 
  Compass, 
  MessageSquare, 
  Brain, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface FeatureGridProps {
  onEnterApp: (tabId?: string) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onEnterApp }) => {
  const features = [
    {
      id: 'trading',
      title: 'Multi-Asset Trading & Valuation Terminal',
      category: 'Capital Markets',
      desc: 'Real-time order book simulations, Yahoo Finance quotes, DCF modeling, and trading academy benchmarks.',
      icon: TrendingUp,
      badge: 'Live Feeds',
      color: 'from-blue-500/20 to-emerald-500/10',
      highlights: ['Interactive DCF Engine', 'Paper Portfolio Tracking', 'Market Depth Visualization']
    },
    {
      id: 'jobs',
      title: 'Career Pipeline & Application Tracker',
      category: 'Career Vault',
      desc: 'Comprehensive CRM for graduate schemes, spring weeks, and part-time internships with deadline heatmaps.',
      icon: Briefcase,
      badge: 'ACCA Optimized',
      color: 'from-amber-500/20 to-rose-500/10',
      highlights: ['Stage Kanban Board', 'Salary & Bonus Tracking', 'Recruiter Outreach Hub']
    },
    {
      id: 'study',
      title: 'Study Intelligence & Virtual Notebooks',
      category: 'Academics',
      desc: 'Multi-document synthesis, automatic flashcard generators, and timed exam simulation powered by Gemini.',
      icon: BookOpen,
      badge: 'Gemini 2.5',
      color: 'from-emerald-500/20 to-cyan-500/10',
      highlights: ['Automated Mock Exams', 'Citation Grounding', 'Spaced Repetition Flashcards']
    },
    {
      id: 'finance',
      title: 'Finance Hub & Visa Compliance Ledger',
      category: 'Personal Finance',
      desc: 'Splitwise-style peer debts, credit card statement monitors, vehicle calculators, and expense categorization.',
      icon: DollarSign,
      badge: 'Encrypted',
      color: 'from-purple-500/20 to-indigo-500/10',
      highlights: ['Multi-Currency Support', 'Invoice Base64 Vault', 'Part-time Work Shift Tracker']
    },
    {
      id: 'metasuite',
      title: 'Executive AI Meta-Suite',
      category: 'Intelligence',
      desc: 'Strategic AI co-pilot featuring multi-model orchestration (Gemini, Claude, OpenAI) for autonomous execution.',
      icon: Brain,
      badge: 'Multi-Model',
      color: 'from-cyan-500/20 to-blue-500/10',
      highlights: ['Auto State Mutation', 'Google Maps Grounding', 'Interview Simulator']
    },
    {
      id: 'travel',
      title: 'Travel CRM & Live TfL Transit Engine',
      category: 'Lifestyle',
      desc: 'City guides, curated travel itineraries, expense splitting with companions, and live London Tube status.',
      icon: Compass,
      badge: 'TfL API',
      color: 'from-rose-500/20 to-amber-500/10',
      highlights: ['Live TfL Arrivals', 'Group Expense Splitting', 'Interactive Map Pins']
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <span className="text-xs font-mono text-[#0052FF] uppercase tracking-widest bg-[#0052FF]/10 px-3 py-1 rounded-full border border-[#0052FF]/20">
          Integrated Architecture
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 tracking-tight">
          Everything you need. Zero context switching.
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-3">
          Constructed for high-output students, finance applicants, and multi-asset traders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card
              key={f.id}
              variant="glass"
              hoverEffect
              className="flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#0052FF] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {f.badge}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {f.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {f.desc}
                </p>

                <div className="space-y-2 mb-6">
                  {f.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onEnterApp(f.id)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="w-full justify-between group-hover:border-[#0052FF] group-hover:bg-[#0052FF]/10 transition-all"
              >
                Launch Module
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureGrid;
