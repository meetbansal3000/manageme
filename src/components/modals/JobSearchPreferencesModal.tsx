// Component: Job Search Preferences Modal
import React from 'react';
import { Sliders, Filter, Sparkles, X } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { Button } from '../ui/Button';

export interface JobSearchPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
  onSave?: (prefs: any) => void;
}

export const JobSearchPreferencesModal: React.FC<JobSearchPreferencesModalProps> = ({
  isOpen,
  onClose,
  targetRole = 'Graduate Scheme / Analyst',
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Job Search & Aggregator Preferences"
      subtitle="Customize active filters, location targets, and auto-ingestion frequency"
      icon={<Sliders className="w-5 h-5 text-blue-400" />}
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs font-mono text-slate-300">
        <div>
          <label className="block uppercase text-[10px] text-slate-400 font-semibold mb-1.5">
            Default Target Role / Keyword
          </label>
          <input
            type="text"
            defaultValue={targetRole}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block uppercase text-[10px] text-slate-400 font-semibold mb-1.5">
              Target Locations
            </label>
            <input
              type="text"
              defaultValue="London, UK; Manchester, UK"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] text-slate-400 font-semibold mb-1.5">
              Experience Level
            </label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
              <option value="grad" className="bg-slate-900">Graduate Schemes (0-2 Yrs)</option>
              <option value="intern" className="bg-slate-900">Summer Internships</option>
              <option value="experienced" className="bg-slate-900">Direct Entry / Associate</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => { if (onSave) onSave({}); onClose(); }}>
            Save Preferences
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default JobSearchPreferencesModal;
