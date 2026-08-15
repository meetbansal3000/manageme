const fs = require('fs');
let grad = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

grad = grad.replace(
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Ranked target firms across Tier-1 Asset Management (BlackRock, Schroders), M&A Boutiques (Lazard, Rothschild), Big 4 Advisory, and Regional Mid-Tiers, with ACCA advantage filters.
          </p>
        </div>`,
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Ranked target firms across Tier-1 Asset Management (BlackRock, Schroders), M&A Boutiques (Lazard, Rothschild), Big 4 Advisory, and Regional Mid-Tiers, with ACCA advantage filters.
          </p>
        </div>
        <div className="flex items-center self-start mt-4 lg:mt-0">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Share2 className="w-4 h-4" /> Share List
          </button>
        </div>`
);

fs.writeFileSync('src/components/GraduateSchemesTab.tsx', grad);
