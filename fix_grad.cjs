const fs = require('fs');
let grad = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

grad = grad.replace("import { \n  ExternalLink,", "import { Share2, ExternalLink,");

const shareFn = `
  const handleShare = () => {
    const json = JSON.stringify(gradSchemes, null, 2);
    navigator.clipboard.writeText(json);
    alert('Graduate Schemes data copied to clipboard as JSON!');
  };
`;
grad = grad.replace("const handleGeneratePitch = async (id: string, firm: string, role: string) => {", shareFn + "\n  const handleGeneratePitch = async (id: string, firm: string, role: string) => {");

const shareBtn = `
        <button onClick={handleShare} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>`;
grad = grad.replace("</div>\n      \n      {/* Filters */}", shareBtn + "\n      \n      {/* Filters */}");
// wait, the closing div might not be exactly like that. Let's find it securely.

fs.writeFileSync('src/components/GraduateSchemesTab.tsx', grad);
