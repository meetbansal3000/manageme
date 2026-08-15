const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { SettingsDrawer } from './components/SettingsDrawer';",
  "import { SettingsDrawer } from './components/SettingsDrawer';\nimport { MorningBriefing } from './components/MorningBriefing';\nimport { DollarSign, Clock, CheckSquare, Bot } from 'lucide-react';"
);

// Add quickLog state
content = content.replace(
  "const [isSettingsOpen, setIsSettingsOpen] = useState(false);",
  "const [isSettingsOpen, setIsSettingsOpen] = useState(false);\n  const [quickLog, setQuickLog] = useState<'expense' | 'shift' | 'task' | 'ai' | null>(null);"
);

// Add MorningBriefing above StatsBar
content = content.replace(
  '<main className="flex-1 pb-16 pt-6">',
  '<main className="flex-1 pb-16 pt-6">\n        <MorningBriefing userData={userData} />'
);

// Update SettingsDrawer props
content = content.replace(
  "<SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />",
  "<SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userData={userData} updateData={updateData} />"
);

// Add floating dock at the end
const floatingDock = `
      {/* macOS Style Quick-Capture Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50]">
        <div className="glass-panel px-4 py-2 rounded-full border border-[var(--border)] shadow-2xl flex items-center gap-4">
          <button onClick={() => setQuickLog('expense')} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-emerald-400 transition-colors" title="Log Expense">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-emerald-500/20 transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
          </button>
          <button onClick={() => setQuickLog('shift')} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-blue-400 transition-colors" title="Log Work Shift">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-blue-500/20 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </button>
          <button onClick={() => setQuickLog('task')} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-amber-400 transition-colors" title="Add Task">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-amber-500/20 transition-colors">
              <CheckSquare className="w-5 h-5" />
            </div>
          </button>
          <div className="w-[1px] h-6 bg-[rgba(255,255,255,0.1)] mx-1"></div>
          <button onClick={() => { /* Gemini AI logic already in GeminiDrawer? */ document.dispatchEvent(new CustomEvent('toggle-gemini')); }} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-purple-400 transition-colors" title="Ask Gemini AI">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-purple-500/20 transition-colors">
              <Bot className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Quick Capture Modals */}
      {quickLog === 'expense' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Quick Log Expense</h3>
            <input type="number" id="quick-expense-amount" placeholder="Amount" className="apple-input bg-[#1c1c1e] w-full mb-3 p-3 text-sm border-transparent" />
            <input type="text" id="quick-expense-desc" placeholder="Description" className="apple-input bg-[#1c1c1e] w-full mb-4 p-3 text-sm border-transparent" />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-2 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button onClick={() => {
                const amt = Number((document.getElementById('quick-expense-amount') as HTMLInputElement).value);
                const desc = (document.getElementById('quick-expense-desc') as HTMLInputElement).value;
                if (amt && desc) {
                  updateData({ expenses: [{ id: Date.now().toString(), amount: amt, description: desc, category: 'Other', date: new Date().toISOString().split('T')[0] }, ...userData.expenses] });
                  setQuickLog(null);
                }
              }} className="flex-1 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Log Expense</button>
            </div>
          </div>
        </div>
      )}

      {quickLog === 'shift' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Quick Log Work Shift</h3>
            <input type="date" id="quick-shift-date" defaultValue={new Date().toISOString().split('T')[0]} className="apple-input bg-[#1c1c1e] w-full mb-3 p-3 text-sm border-transparent" />
            <input type="number" id="quick-shift-hrs" placeholder="Hours" className="apple-input bg-[#1c1c1e] w-full mb-4 p-3 text-sm border-transparent" />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-2 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button onClick={() => {
                const date = (document.getElementById('quick-shift-date') as HTMLInputElement).value;
                const hrs = Number((document.getElementById('quick-shift-hrs') as HTMLInputElement).value);
                if (date && hrs) {
                  updateData({ workShifts: [{ id: Date.now().toString(), date, hours: hrs, startTime: '09:00', endTime: '17:00' }, ...userData.workShifts] });
                  setQuickLog(null);
                }
              }} className="flex-1 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Log Shift</button>
            </div>
          </div>
        </div>
      )}

      {quickLog === 'task' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Quick Add Task</h3>
            <input type="text" id="quick-task-desc" placeholder="Task Description" className="apple-input bg-[#1c1c1e] w-full mb-4 p-3 text-sm border-transparent" />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-2 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button onClick={() => {
                const desc = (document.getElementById('quick-task-desc') as HTMLInputElement).value;
                if (desc) {
                  updateData({ priorityItems: [{ id: Date.now().toString(), firm: desc, sector: 'Task', role: '', status: 'Not Applied', deadline: '' }, ...userData.priorityItems] });
                  setQuickLog(null);
                }
              }} className="flex-1 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Add Task</button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "{/* Modals & Drawers */}",
  floatingDock + "\n\n      {/* Modals & Drawers */}"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx with Dock and Modals!");
