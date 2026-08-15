const fs = require('fs');
let code = fs.readFileSync('src/components/KeyNotesChecklistTab.tsx', 'utf8');

code = code.replace(
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Critical arrival action items (UK bank account, NI number, BRP pickup within 10 days, ACCA DipIFR 6 Oct registration) and application strategy rules.
          </p>
        </div>`,
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Critical arrival action items (UK bank account, NI number, BRP pickup within 10 days, ACCA DipIFR 6 Oct registration) and application strategy rules.
          </p>
        </div>
        <div className="flex items-center self-start mt-4 lg:mt-0">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Share2 className="w-4 h-4" /> Share List
          </button>
        </div>`
);

fs.writeFileSync('src/components/KeyNotesChecklistTab.tsx', code);
