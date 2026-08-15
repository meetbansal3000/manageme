const fs = require('fs');
let code = fs.readFileSync('src/components/AddApplicationModal.tsx', 'utf8');

if (!code.includes("import { SmartTextarea }")) {
  code = code.replace(
    "import { X, Calendar, Search, MapPin } from 'lucide-react';",
    "import { X, Calendar, Search, MapPin } from 'lucide-react';\nimport { SmartTextarea } from './SmartTextarea';"
  );
  
  code = code.replace(
    /<textarea[\s\S]*?onChange=\{\(e\) => setNotes\(e.target.value\)\}[\s\S]*?\/>/,
    `<SmartTextarea
              rows={2}
              placeholder="Key strategic advantages, referral contacts, or requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] text-xs focus:outline-none"
            />`
  );
  
  fs.writeFileSync('src/components/AddApplicationModal.tsx', code);
}
