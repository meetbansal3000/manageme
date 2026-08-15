const fs = require('fs');
let content = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

content = content.replace(
  "import { Search, Filter, ExternalLink, Plus, MapPin, Building2, Briefcase, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';",
  "import { Search, Filter, ExternalLink, Plus, MapPin, Building2, Briefcase, Calendar, CheckCircle2, Circle, Clock, Bot, Loader2 } from 'lucide-react';\nimport { useState } from 'react';"
);

// State for AI Pitch
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
          skills: ['ACCA', 'CFA', 'Excel', 'IFRS'] // Mock active skills for now
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
`;
// Let's insert it before `return (`
content = content.replace(
  "  return (",
  stateLogic + "\n  return ("
);

// Button UI
const buttonUI = `
                <button 
                  onClick={() => handleGeneratePitch(scheme.id, scheme.firm, scheme.role)}
                  disabled={loadingPitch === scheme.id}
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors w-max"
                >
                  {loadingPitch === scheme.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                  AI Resume Pitch
                </button>
                {pitchData[scheme.id] && (
                  <div className="mt-3 p-3 bg-blue-500/10 rounded-lg text-xs text-[var(--text-secondary)]">
                    <ul className="list-disc list-inside space-y-1">
                      {pitchData[scheme.id].map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                )}
`;

content = content.replace(
  "              </div>\n            </div>\n          ))",
  buttonUI + "\n              </div>\n            </div>\n          ))"
);

fs.writeFileSync('src/components/GraduateSchemesTab.tsx', content);
console.log("Updated GraduateSchemesTab.tsx");
