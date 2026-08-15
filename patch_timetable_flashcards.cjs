const fs = require('fs');
let content = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');

// Update imports
content = content.replace(
  "import { Calendar, Clock, MapPin, Plus, Trash2, Award, Upload, Loader2 } from 'lucide-react';",
  "import { Calendar, Clock, MapPin, Plus, Trash2, Award, Upload, Loader2, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';"
);

// Add 'flashcards' to subTab state type (replace it where it's defined and the toggle)
content = content.replace(
  "const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'grades'>('schedule');",
  "const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'grades' | 'flashcards'>('schedule');\n  const [isGeneratingCards, setIsGeneratingCards] = useState(false);\n  const [flashcards, setFlashcards] = useState<{front: string, back: string}[]>([]);\n  const [activeCardIndex, setActiveCardIndex] = useState(0);\n  const [isFlipped, setIsFlipped] = useState(false);\n  const notesInputRef = useRef<HTMLInputElement>(null);"
);

// Toggle UI update
content = content.replace(
  /<button\s*onClick=\{\(\) => setActiveSubTab\('grades'\)\}[\s\S]*?<\/button>/,
  `$&
        <button 
          onClick={() => setActiveSubTab('flashcards')}
          className={\`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all \${activeSubTab === 'flashcards' ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}\`}
        >
          AI Flashcards
        </button>`
);

// Handle Flashcards upload
const handleNotesUpload = `
  const handleNotesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGeneratingCards(true);
    try {
      const formData = new FormData();
      formData.append('notes', file);

      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate flashcards');
      }

      const data = await response.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
        setActiveCardIndex(0);
        setIsFlipped(false);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingCards(false);
      if (notesInputRef.current) notesInputRef.current.value = '';
    }
  };
`;
content = content.replace(
  "const handleFileUpload = async ",
  handleNotesUpload + "\n  const handleFileUpload = async "
);

// UI for Flashcards
const flashcardsUI = `
      {activeSubTab === 'flashcards' && (
        <div className="space-y-6 animate-fade-in">
          <div 
            className="glass-panel p-6 rounded-3xl border border-[var(--border)] border-dashed mb-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors relative overflow-hidden"
            onClick={() => !isGeneratingCards && notesInputRef.current?.click()}
          >
            {isGeneratingCards ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">Gemini is creating your flashcards...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">AI Exam Flashcard Generator</h3>
                <p className="text-xs text-[var(--text-secondary)]">Upload Lecture Notes or Slides (PDF/TXT) to generate 5 interactive study cards.</p>
              </>
            )}
            <input 
              type="file" 
              ref={notesInputRef} 
              className="hidden" 
              accept=".pdf,.txt" 
              onChange={handleNotesUpload} 
              disabled={isGeneratingCards}
            />
          </div>

          {flashcards.length > 0 && (
            <div className="flex flex-col items-center">
              <div 
                className="w-full max-w-lg aspect-video glass-panel rounded-3xl border border-[var(--border)] shadow-xl cursor-pointer flex items-center justify-center p-8 text-center relative"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: '1000px' }}
              >
                <div 
                  className="absolute inset-0 w-full h-full transition-all duration-500 flex items-center justify-center p-8"
                  style={{ 
                    transformStyle: 'preserve-3d', 
                    transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' 
                  }}
                >
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-[rgba(255,255,255,0.02)] rounded-3xl border-2 border-purple-500/20" style={{ backfaceVisibility: 'hidden' }}>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{flashcards[activeCardIndex].front}</h3>
                  </div>
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-purple-500/10 rounded-3xl border-2 border-purple-500/30" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
                    <p className="text-base font-medium text-purple-100">{flashcards[activeCardIndex].back}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-6">
                <button 
                  onClick={() => { setActiveCardIndex(Math.max(0, activeCardIndex - 1)); setIsFlipped(false); }}
                  disabled={activeCardIndex === 0}
                  className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-sm font-bold text-[var(--text-secondary)]">{activeCardIndex + 1} / {flashcards.length}</span>
                <button 
                  onClick={() => { setActiveCardIndex(Math.min(flashcards.length - 1, activeCardIndex + 1)); setIsFlipped(false); }}
                  disabled={activeCardIndex === flashcards.length - 1}
                  className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
`;

content = content.replace(
  "{activeSubTab === 'schedule' ? (",
  flashcardsUI + "\n      {activeSubTab === 'schedule' && ("
);

// We need to fix the 'schedule' and 'grades' checks
content = content.replace(
  "      {activeSubTab === 'schedule' && (\n        <>",
  "      {activeSubTab === 'schedule' && (\n        <>"
);

content = content.replace(
  /        <\/>\n      \) : \(/,
  "        </>\n      )}\n      {activeSubTab === 'grades' && ("
);

fs.writeFileSync('src/components/UniTimetableTab.tsx', content);
console.log("Updated UniTimetableTab.tsx with Flashcards");
