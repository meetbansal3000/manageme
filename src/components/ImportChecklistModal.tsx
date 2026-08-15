import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  Layers, 
  ArrowDownToLine, 
  HelpCircle,
  FileJson
} from 'lucide-react';
import { ChecklistItem, NoteSection } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface ImportChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSection: NoteSection | null;
  onImport: (targetSectionId: string, items: ChecklistItem[], mode: 'append' | 'overwrite') => void;
}

export const ImportChecklistModal: React.FC<ImportChecklistModalProps> = ({
  isOpen,
  onClose,
  targetSection,
  onImport
}) => {
  useScrollLock(isOpen);
  useModalDismiss(isOpen, onClose);

  const [activeMode, setActiveMode] = useState<'text' | 'file'>('text');
  const [bulkText, setBulkText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedFileItems, setParsedFileItems] = useState<ChecklistItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !targetSection) return null;

  // --- Parse raw bulk text (one item per line) ---
  const parseBulkTextToItems = (text: string): ChecklistItem[] => {
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return lines.map((line, idx) => {
      // Strip leading bullet markers if present (e.g. "- ", "* ", "[ ]", "1. ")
      let cleanLine = line.replace(/^(\s*[-*•]|\s*\[[ xX]?\]|\s*\d+[\.\)])\s+/, '').trim();
      let isUrgent = false;
      let details = 'Imported checklist item';

      // Support tag like "[URGENT]" or "[urgent]"
      if (cleanLine.toUpperCase().startsWith('[URGENT]')) {
        isUrgent = true;
        cleanLine = cleanLine.replace(/^\[URGENT\]\s*/i, '').trim();
      }

      // Check if line contains a separator (e.g. "Title - Details" or "Title | Details")
      if (cleanLine.includes(' | ')) {
        const parts = cleanLine.split(' | ');
        cleanLine = parts[0].trim();
        details = parts.slice(1).join(' | ').trim() || details;
      } else if (cleanLine.includes(' :: ')) {
        const parts = cleanLine.split(' :: ');
        cleanLine = parts[0].trim();
        details = parts.slice(1).join(' :: ').trim() || details;
      }

      return {
        id: `chk-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: cleanLine,
        details: details,
        completed: false,
        isUrgent: isUrgent
      };
    });
  };

  // --- Parse CSV / JSON File ---
  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setSelectedFile(file);

    try {
      const text = await file.text();
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.json')) {
        const parsed = JSON.parse(text);
        let items: ChecklistItem[] = [];

        if (Array.isArray(parsed)) {
          items = parsed.map((it: any, i: number) => ({
            id: it.id || `chk-json-${Date.now()}-${i}`,
            title: String(it.title || it.task || it.name || it.item || `Task ${i + 1}`).trim(),
            details: String(it.details || it.description || it.notes || 'Imported via JSON').trim(),
            completed: Boolean(it.completed ?? false),
            isUrgent: Boolean(it.isUrgent ?? it.urgent ?? false),
            link: it.link ? String(it.link) : undefined
          }));
        } else if (parsed && typeof parsed === 'object') {
          // If structure is { items: [...] } or { checklist: [...] }
          const list = parsed.items || parsed.checklist || parsed.tasks || [];
          if (Array.isArray(list)) {
            items = list.map((it: any, i: number) => ({
              id: it.id || `chk-json-${Date.now()}-${i}`,
              title: String(it.title || it.task || it.name || it.item || `Task ${i + 1}`).trim(),
              details: String(it.details || it.description || it.notes || 'Imported via JSON').trim(),
              completed: Boolean(it.completed ?? false),
              isUrgent: Boolean(it.isUrgent ?? it.urgent ?? false),
              link: it.link ? String(it.link) : undefined
            }));
          } else {
            throw new Error('JSON format not recognized. Expected an array of items or an object with an "items" array.');
          }
        }

        if (items.length === 0) {
          throw new Error('No valid checklist items found in JSON file.');
        }
        setParsedFileItems(items);

      } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) throw new Error('File is empty.');

        // Check if first row is header
        let startIndex = 0;
        const firstLineLower = lines[0].toLowerCase();
        if (firstLineLower.includes('title') || firstLineLower.includes('task') || firstLineLower.includes('item')) {
          startIndex = 1;
        }

        const items: ChecklistItem[] = [];
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          // Basic CSV parsing splitting by comma (respecting quotes simple pass)
          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
          const title = columns[0] || '';
          if (!title) continue;

          const details = columns[1] || 'Imported via CSV';
          const isUrgent = columns[2] ? (columns[2].toLowerCase() === 'true' || columns[2].toLowerCase() === 'urgent' || columns[2].toLowerCase() === 'yes' || columns[2] === '1') : false;
          const isCompleted = columns[3] ? (columns[3].toLowerCase() === 'true' || columns[3].toLowerCase() === 'done' || columns[3].toLowerCase() === 'yes' || columns[3] === '1') : false;

          items.push({
            id: `chk-csv-${Date.now()}-${i}`,
            title,
            details,
            completed: isCompleted,
            isUrgent
          });
        }

        if (items.length === 0) {
          throw new Error('Could not parse any checklist items from CSV.');
        }
        setParsedFileItems(items);
      } else {
        throw new Error('Unsupported file type. Please upload a .json or .csv file.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to read and parse the file.');
      setParsedFileItems([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteImport = () => {
    setErrorMsg(null);
    let itemsToImport: ChecklistItem[] = [];

    if (activeMode === 'text') {
      if (!bulkText.trim()) {
        setErrorMsg('Please enter at least one task or checklist item in the text area.');
        return;
      }
      itemsToImport = parseBulkTextToItems(bulkText);
    } else {
      if (parsedFileItems.length === 0) {
        setErrorMsg('Please upload and select a valid .json or .csv checklist file.');
        return;
      }
      itemsToImport = parsedFileItems;
    }

    if (itemsToImport.length === 0) {
      setErrorMsg('No items were parsed for import.');
      return;
    }

    onImport(targetSection.id, itemsToImport, importMode);
    onClose();
  };

  const previewCount = activeMode === 'text' 
    ? bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean).length 
    : parsedFileItems.length;

  return (
    <div 
      id="importChecklistModalOverlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        id="importChecklistModalContent"
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 text-[var(--text-primary)] rounded-3xl p-6 sm:p-7 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Import Checklist
                <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-normal border border-neutral-700">
                  {targetSection.title}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Bulk import tasks via plain text or upload JSON/CSV datasets
              </p>
            </div>
          </div>

          <button 
            id="closeImportChecklistModalBtn"
            onClick={onClose} 
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Text vs File */}
        <div className="flex p-1 mt-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
          <button
            id="importTabBulkTextBtn"
            onClick={() => { setActiveMode('text'); setErrorMsg(null); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'text' 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Bulk Text Input
          </button>
          <button
            id="importTabFileUploadBtn"
            onClick={() => { setActiveMode('file'); setErrorMsg(null); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'file' 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> JSON / CSV Upload
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* Method 1: Bulk Text Input */}
          {activeMode === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  Paste your task list (one task per line)
                </label>
                <span className="text-[11px] font-mono text-neutral-400">
                  {previewCount} {previewCount === 1 ? 'item' : 'items'} detected
                </span>
              </div>

              <textarea
                id="bulkImportTextarea"
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Example:\nSubmit professional registration by 6 Oct\nOrder BRP collection letter\nPractice numerical reasoning tests | 2 full mock exams\n[URGENT] Register with local GP Surgery :: Bring passport & proof of address\nBook university accommodation`}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-[var(--accent)] rounded-2xl p-3.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none font-mono leading-relaxed resize-y min-h-[140px]"
              />

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" /> Pro-tips for formatting:
                </div>
                <p>• Prefix with <code className="text-red-400 bg-neutral-800 px-1 py-0.5 rounded text-[10px]">[URGENT]</code> to automatically flag high priority.</p>
                <p>• Use <code className="text-neutral-200 bg-neutral-800 px-1 py-0.5 rounded text-[10px]">|</code> or <code className="text-neutral-200 bg-neutral-800 px-1 py-0.5 rounded text-[10px]">::</code> to separate Task Title from details/instructions.</p>
              </div>
            </div>
          )}

          {/* Method 2: File Upload (JSON / CSV) */}
          {activeMode === 'file' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div
                id="importFileDropZone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                    : selectedFile 
                    ? 'border-emerald-500/50 bg-emerald-950/20' 
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-950'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                  {selectedFile ? (
                    <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Upload className="w-6 h-6 text-[var(--accent)]" />
                  )}
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-white">{selectedFile.name}</p>
                    <p className="text-[11px] text-emerald-400 mt-0.5 font-mono">
                      ✓ Ready: {parsedFileItems.length} items parsed
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-neutral-200">
                      Click to browse or drag and drop your checklist file
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Supports .JSON, .CSV, or .TXT structured lists
                    </p>
                  </div>
                )}
              </div>

              {/* CSV / JSON sample schema helper */}
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                  <FileJson className="w-3.5 h-3.5 text-sky-400" /> Supported Schemas:
                </div>
                <p>• <strong>CSV Format:</strong> <code className="text-neutral-300 font-mono">Title, Details, isUrgent, isCompleted</code></p>
                <p>• <strong>JSON Format:</strong> Array of objects <code className="text-neutral-300 font-mono">[{`{ "title": "...", "details": "...", "isUrgent": true }`}]</code></p>
              </div>
            </div>
          )}

          {/* Options & Controls: Mode Toggle */}
          <div className="pt-2 border-t border-neutral-800">
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Import Destination & Strategy:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="importModeAppendBtn"
                onClick={() => setImportMode('append')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  importMode === 'append'
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  importMode === 'append' ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-neutral-600'
                }`}>
                  {importMode === 'append' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-semibold">Append to list</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Keep existing ({targetSection.items?.length || 0}) items and add new</div>
                </div>
              </button>

              <button
                type="button"
                id="importModeOverwriteBtn"
                onClick={() => setImportMode('overwrite')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  importMode === 'overwrite'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  importMode === 'overwrite' ? 'border-amber-500 bg-amber-500' : 'border-neutral-600'
                }`}>
                  {importMode === 'overwrite' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-semibold">Overwrite existing</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Replace current section items entirely</div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-2">
          <button
            type="button"
            id="cancelImportChecklistBtn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="submitImportChecklistBtn"
            onClick={handleExecuteImport}
            disabled={previewCount === 0}
            className="px-5 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Import {previewCount > 0 ? `${previewCount} Items` : 'Items'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
