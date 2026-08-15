const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { SettingsDrawer } from './components/SettingsDrawer';",
  "import { SettingsDrawer } from './components/SettingsDrawer';\nimport { InterviewSimulatorDrawer } from './components/InterviewSimulatorDrawer';"
);

content = content.replace(
  "const [quickLog, setQuickLog] = useState<'expense' | 'shift' | 'task' | 'ai' | null>(null);",
  "const [quickLog, setQuickLog] = useState<'expense' | 'shift' | 'task' | 'ai' | 'quick' | null>(null);\n  const [isInterviewOpen, setIsInterviewOpen] = useState(false);"
);

// We need the Natural Language Quick-Capture Bar in the Dock too.
// "Add a single text box in the Floating Dock: 'Type anything to log (e.g., 'Worked 5 hrs at £13/hr' or 'Paid £12 for lunch')'."
// So quickLog === 'quick' -> opens the natural language input. Let's add a button to the dock.
const dockAddition = `
          <div className="w-[1px] h-6 bg-[rgba(255,255,255,0.1)] mx-1"></div>
          <button onClick={() => setQuickLog('quick')} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-indigo-400 transition-colors" title="AI Quick Log">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-5 h-5" />
            </div>
          </button>
          <button onClick={() => setIsInterviewOpen(true)} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-rose-400 transition-colors" title="Interview Simulator">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-rose-500/20 transition-colors">
              <Bot className="w-5 h-5" />
            </div>
          </button>
`;

content = content.replace(
  /<div className="w-\[1px\] h-6 bg-\[rgba\(255,255,255,0\.1\)\] mx-1"><\/div>[\s\S]*?Ask Gemini AI"[\s\S]*?<\/button>/,
  dockAddition
);

const quickCaptureModal = `
      {quickLog === 'quick' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-indigo-400"/> AI Quick Capture</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Type naturally. Gemini will figure out if it's an expense or a work shift.</p>
            <input type="text" id="quick-ai-input" placeholder="e.g., Paid £12 for lunch at Nando's..." className="apple-input bg-[#1c1c1e] w-full mb-4 p-4 text-sm border-transparent" onKeyDown={e => { if (e.key === 'Enter') document.getElementById('quick-ai-btn')?.click(); }} />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-3 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button id="quick-ai-btn" onClick={async () => {
                const btn = document.getElementById('quick-ai-btn') as HTMLButtonElement;
                const input = document.getElementById('quick-ai-input') as HTMLInputElement;
                const text = input.value;
                if (!text) return;
                btn.disabled = true;
                btn.innerText = 'Thinking...';
                try {
                  const res = await fetch('/api/quick-capture', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text}) });
                  const data = await res.json();
                  if (data.type === 'expense') {
                    updateData({ expenses: [{ id: Date.now().toString(), amount: data.data.amount || 0, description: data.data.description || 'Quick AI', category: data.data.category || 'Other', date: data.data.date || new Date().toISOString().split('T')[0] }, ...userData.expenses] });
                    alert('Expense logged successfully!');
                  } else if (data.type === 'shift') {
                    updateData({ workShifts: [{ id: Date.now().toString(), hours: data.data.hours || 0, date: data.data.date || new Date().toISOString().split('T')[0], startTime: data.data.startTime || '09:00', endTime: data.data.endTime || '17:00' }, ...userData.workShifts] });
                    alert('Work shift logged successfully!');
                  } else {
                    alert('Could not determine action from text.');
                  }
                  setQuickLog(null);
                } catch(e:any) {
                  alert(e.message);
                  btn.disabled = false;
                  btn.innerText = 'Parse & Log';
                }
              }} className="flex-1 py-3 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Parse & Log</button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "{/* Quick Capture Modals */}",
  "{/* Quick Capture Modals */}\n" + quickCaptureModal
);

const interviewDrawerUI = `
      <InterviewSimulatorDrawer isOpen={isInterviewOpen} onClose={() => setIsInterviewOpen(false)} />
`;
content = content.replace(
  "<SettingsDrawer",
  interviewDrawerUI + "\n      <SettingsDrawer"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx with Quick Capture and Interview Simulator");
