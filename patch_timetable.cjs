const fs = require('fs');
let content = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');

// 1. Imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useRef } from 'react';"
);
content = content.replace(
  "import { Calendar, Clock, MapPin, Plus, Trash2, Award } from 'lucide-react';",
  "import { Calendar, Clock, MapPin, Plus, Trash2, Award, Upload, Loader2 } from 'lucide-react';"
);

// 2. Add state and ref
const stateLogic = `
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'grades'>('schedule');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
`;
content = content.replace(
  "const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'grades'>('schedule');",
  stateLogic
);

// 3. Add handler
const handlerLogic = `
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
        alert(\`Timetable imported successfully! \${newClasses.length} classes added.\`);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddClass = () => {
`;
content = content.replace(
  "const handleAddClass = () => {",
  handlerLogic
);

// 4. Add UI
const uploadUI = `
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
`;

content = content.replace(
  "{userData.termStatus === 'Vacation' && (\n        <div className=\"bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex items-center justify-center font-medium\">\n          Classes are currently in recess. Work shift conflict warnings are disabled.\n        </div>\n      )}\n      {/* Add Class Form */}",
  uploadUI
);

// Check if replacement was successful. If not, just replace the Add Class Form section.
if (content.indexOf("Auto-Import") === -1) {
  content = content.replace(
    "{/* Add Class Form */}",
    uploadUI
  );
}


fs.writeFileSync('src/components/UniTimetableTab.tsx', content);
console.log("Updated UniTimetableTab.tsx with Auto-Import feature");
