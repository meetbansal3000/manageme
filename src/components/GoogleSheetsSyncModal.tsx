import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  UploadCloud, 
  Download, 
  X
} from 'lucide-react';
import { 
  TimelineItem, 
  GraduateScheme, 
  PartTimeRole, 
  PriorityTrackerItem, 
  NoteSection,
  GoogleSyncState
} from '../types';
import { generateGoogleSheetsTSV } from '../utils/googleSheetsService';
import { exportMultiSheetWorkbook } from '../utils/excelExporter';
import { useScrollLock } from '../hooks/useScrollLock';

import { useModalDismiss } from '../hooks/useModalDismiss';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: TimelineItem[];
  gradSchemes: GraduateScheme[];
  partTime: PartTimeRole[];
  priorityTracker: PriorityTrackerItem[];
  notesSections: NoteSection[];
  googleSyncState: GoogleSyncState;
  onConnectGoogle: () => void;
  onCreateGoogleSheet: () => Promise<void>;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  timeline,
  gradSchemes,
  partTime,
  priorityTracker,
  notesSections,
  googleSyncState,
  onCreateGoogleSheet
}) => {
  useScrollLock(isOpen);
  useModalDismiss(isOpen, onClose);

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedTSVMode, setSelectedTSVMode] = useState<'all' | 'timeline' | 'grad' | 'parttime' | 'priority' | 'notes'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyTSV = () => {
    const tsv = generateGoogleSheetsTSV(
      selectedTSVMode,
      timeline,
      gradSchemes,
      partTime,
      priorityTracker,
      notesSections
    );
    navigator.clipboard.writeText(tsv);
    setCopiedFormat(selectedTSVMode);
    setStatusMessage(`Copied ${selectedTSVMode.toUpperCase()} data in TSV format. Open Google Sheets and press Cmd/Ctrl + V.`);
    setTimeout(() => setCopiedFormat(null), 3000);
  };

  const handleCreateSheet = async () => {
    setIsProcessing(true);
    setStatusMessage('Uploading 5-sheet master workbook to Google Drive...');
    try {
      await onCreateGoogleSheet();
      setStatusMessage('Spreadsheet created and uploaded to Google Drive!');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || 'Failed to upload'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/70 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[var(--bg)] border border-[var(--border)] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-0 float-right -mt-2 -mr-2 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-full text-[var(--text-secondary)] hover:text-white shadow z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[var(--border)] pb-4 mt-0">
          <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest">
            EXPORT & SYNC
          </div>
          <h3 className="apple-headline text-3xl font-semibold text-[var(--text-primary)] mt-1">
            Google Drive & Sheets Access
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Access the master 5-sheet tracker in Google Drive, export native Excel (.xlsx), or copy raw TSV tables.
          </p>
        </div>

        {/* Option 1: Direct Google Drive Upload */}
        <div className="bg-[var(--surface-solid)] border border-[var(--border)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-space-mono text-xs uppercase font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-[var(--accent)]">01 /</span> Upload 5-Sheet Master to Google Drive
            </h4>
            {googleSyncState.isConnected && (
              <span className="font-space-mono text-[10px] text-[var(--accent)]">
                OAuth Connected
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--text-primary)]/80 leading-relaxed">
            Directly uploads all 5 distinct sheets (Timeline, 26 Graduate Schemes, 15 Practice Roles, Priority Pipeline, Key Notes) to Google Drive as an editable Google Spreadsheet.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleCreateSheet}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#004d40] hover:bg-[#003d33] text-white font-space-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              <span>{isProcessing ? 'Uploading to Drive...' : 'Upload Master to Google Drive'}</span>
            </button>

            {googleSyncState.spreadsheetUrl && (
              <a
                href={googleSyncState.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--border)] font-space-mono text-xs text-[var(--text-primary)] hover:bg-[var(--surface-solid)] transition-all"
              >
                <span>Open in Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Option 2: Offline 5-Sheet Excel File */}
        <div className="bg-[var(--surface-solid)] border border-[var(--border)] p-4 space-y-3">
          <h4 className="font-space-mono text-xs uppercase font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="text-[var(--accent)]">02 /</span> Download Native Excel (.xlsx)
          </h4>

          <button
            onClick={() => {
              exportMultiSheetWorkbook(timeline, gradSchemes, partTime, priorityTracker, notesSections);
            }}
            className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] text-left hover:bg-[var(--surface-solid)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-space-mono text-xs font-bold text-[var(--text-primary)]">5-SHEET MASTER WORKBOOK (.xlsx)</span>
              </div>
              <Download className="w-4 h-4 text-[var(--text-primary)]" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              One file with 5 separate tabs: Timeline, Graduate Schemes, Part-Time Roles, Priority Tracker, Key Notes.
            </p>
          </button>
        </div>

        {/* Option 3: Quick Copy TSV for Google Sheets */}
        <div className="bg-[var(--surface-solid)] border border-[var(--border)] p-4 space-y-3">
          <h4 className="font-space-mono text-xs uppercase font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="text-[var(--accent)]">03 /</span> Instant Copy (Paste into Google Sheets)
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTSVMode}
              onChange={(e) => setSelectedTSVMode(e.target.value as any)}
              className="px-2.5 py-1.5 bg-transparent border border-[var(--border)] font-space-mono text-xs text-[var(--text-primary)] focus:outline-none"
            >
              <option value="all">ALL 5 SHEETS (Combined)</option>
              <option value="timeline">Timeline (Aug 2026 – Sep 2027)</option>
              <option value="grad">Graduate Schemes (26 Targets)</option>
              <option value="parttime">Part-Time Roles (15 Practice Roles)</option>
              <option value="priority">Priority Tracker Only</option>
              <option value="notes">Key Notes & Checklist</option>
            </select>

            <button
              onClick={handleCopyTSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#004d40] text-white font-space-mono text-xs uppercase tracking-wider transition-all"
            >
              {copiedFormat ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat ? 'Copied!' : 'Copy TSV'}</span>
            </button>
          </div>

          {statusMessage && (
            <div className="p-2 bg-emerald-500/10 border border-[#004d40] text-xs font-space-mono text-[var(--accent)]">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--border)] font-space-mono text-xs uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--surface-solid)]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
