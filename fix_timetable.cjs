const fs = require('fs');

let content = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');

// We need to add the Upload feature.
// Let's add state and ref
if (!content.includes('isUploading')) {
  const insertState = `
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('timetable', file);
    
    try {
      const response = await fetch('/api/upload-timetable', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to parse timetable');
      const data = await response.json();
      
      if (data.success && data.classes) {
        updateData({ uniClasses: [...(userData.uniClasses || []), ...data.classes] });
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing timetable screenshot');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
`;
  content = content.replace("const [tempClass, setTempClass] = useState<Partial<UniClass>>({});", insertState + "\n  const [tempClass, setTempClass] = useState<Partial<UniClass>>({});");
}

// Add the UI button right after "Add Class"
const btnReplace = `<button 
              onClick={() => setIsAddClassOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg)] rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>`;
            
const newBtns = `<div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*,.pdf" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-colors whitespace-nowrap"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              AI OCR Timetable
            </button>
            <button 
              onClick={() => setIsAddClassOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg)] rounded-xl text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>`;

content = content.replace(btnReplace, newBtns);
fs.writeFileSync('src/components/UniTimetableTab.tsx', content);
