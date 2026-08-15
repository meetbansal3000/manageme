const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  "onOpenActivityDrawer: () => void;",
  "onOpenActivityDrawer: () => void;\n  onOpenSmartImport: () => void;"
);
code = code.replace(
  "onOpenActivityDrawer,",
  "onOpenActivityDrawer,\n  onOpenSmartImport,"
);

const smartImportBtn = `
          <button 
            onClick={onOpenSmartImport}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--accent)]/10 text-[var(--accent)] transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" /> Smart Import
          </button>
`;

code = code.replace(
  `<button 
            onClick={onExportMultiSheet}`,
  smartImportBtn + `\n          <button 
            onClick={onExportMultiSheet}`
);

fs.writeFileSync('src/components/Header.tsx', code);
