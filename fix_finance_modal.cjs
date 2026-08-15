const fs = require('fs');
let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

// Add state for conflict modal
content = content.replace(
  'const fileInputRef = useRef<HTMLInputElement>(null);',
  'const fileInputRef = useRef<HTMLInputElement>(null);\n  const [conflictWarning, setConflictWarning] = useState<string | null>(null);'
);

// Replace alert with setConflictWarning
content = content.replace(
  /alert\(\`Schedule Conflict Detected: This work shift overlaps with your \$\{conflict\} lecture.\`\);/g,
  "setConflictWarning(`Schedule Conflict Detected: This work shift overlaps with your ${conflict} class.`);"
);

// Add modal JSX at the end of the component
const modalJSX = `
      {conflictWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--surface-solid)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Schedule Conflict</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">{conflictWarning}</p>
            <button 
              onClick={() => setConflictWarning(null)}
              className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
`;

content = content.replace(
  '    </div>\n  );\n};',
  modalJSX
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
console.log("Updated FinanceHubTab.tsx with modal!");
