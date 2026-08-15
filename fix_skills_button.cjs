const fs = require('fs');
let code = fs.readFileSync('src/components/SkillsTrackerTab.tsx', 'utf8');

code = code.replace(
  `            <p className="text-[var(--text-secondary)] text-sm mt-1 flex gap-4">
              <span>{completedCount} of {skills.length} Completed</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Ranked by Strategic Priority</span>
            </p>
          </div>
        </div>`,
  `            <p className="text-[var(--text-secondary)] text-sm mt-1 flex gap-4">
              <span>{completedCount} of {skills.length} Completed</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Ranked by Strategic Priority</span>
            </p>
          </div>
        </div>
        <div className="flex items-center self-start mt-4 md:mt-0">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Share2 className="w-4 h-4" /> Share Roadmap
          </button>
        </div>`
);

fs.writeFileSync('src/components/SkillsTrackerTab.tsx', code);
