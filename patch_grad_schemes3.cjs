const fs = require('fs');
let content = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

if (!content.includes('import { useState }')) {
  content = content.replace(
    "import React from 'react';",
    "import React, { useState } from 'react';"
  );
  content = content.replace(
    "import { Search, Info, ExternalLink } from 'lucide-react';",
    "import { Search, Info, ExternalLink, Bot, Loader2 } from 'lucide-react';"
  );
}

const stateLogic = `
  const [pitchData, setPitchData] = useState<{ [key: string]: string[] }>({});
  const [loadingPitch, setLoadingPitch] = useState<string | null>(null);

  const handleGeneratePitch = async (id: string, firm: string, role: string) => {
    setLoadingPitch(id);
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firm,
          role,
          skills: ['ACCA', 'CFA', 'Excel', 'IFRS'] // Mock active skills
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPitchData(prev => ({ ...prev, [id]: data.bullets }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingPitch(null);
    }
  };

  const filteredData = GRAD_SCHEMES_2025.filter(g => {
`;

content = content.replace(
  "  const filteredData = GRAD_SCHEMES_2025.filter(g => {",
  stateLogic
);

fs.writeFileSync('src/components/GraduateSchemesTab.tsx', content);
console.log("Updated GraduateSchemesTab.tsx state");
