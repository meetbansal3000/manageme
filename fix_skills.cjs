const fs = require('fs');
let code = fs.readFileSync('src/components/SkillsTrackerTab.tsx', 'utf8');

code = code.replace("import { \n  Target,", "import { Share2, Target,");

const shareFn = `
  const handleShare = () => {
    const json = JSON.stringify(skills, null, 2);
    navigator.clipboard.writeText(json);
    alert('Skills Roadmap data copied to clipboard as JSON!');
  };
`;
code = code.replace("const [searchQuery, setSearchQuery] = useState('');", "const [searchQuery, setSearchQuery] = useState('');\n" + shareFn);

code = code.replace(
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Targeted skill acquisition for Asset Management and CFA preparation.
          </p>
        </div>`,
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Targeted skill acquisition for Asset Management and CFA preparation.
          </p>
        </div>
        <div className="flex items-center self-start mt-4 lg:mt-0">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Share2 className="w-4 h-4" /> Share Roadmap
          </button>
        </div>`
);

fs.writeFileSync('src/components/SkillsTrackerTab.tsx', code);
