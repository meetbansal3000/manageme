const fs = require('fs');
let content = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

const buttonUI = `
                  <td className="py-3 px-3.5 text-xs text-[var(--text-primary)] align-top font-medium">
                    {g.roleTitle}
                    <button 
                      onClick={() => handleGeneratePitch(g.id, g.firm, g.roleTitle)}
                      disabled={loadingPitch === g.id}
                      className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[9px] font-bold hover:bg-blue-500/20 transition-colors w-max"
                    >
                      {loadingPitch === g.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Bot className="w-2.5 h-2.5" />}
                      AI Resume Pitch
                    </button>
                    {pitchData[g.id] && (
                      <div className="mt-2 p-2 bg-blue-500/10 rounded-md text-[9px] text-[var(--text-secondary)] whitespace-normal w-40">
                        <ul className="list-disc list-inside space-y-0.5">
                          {pitchData[g.id].map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    )}
                  </td>
`;

content = content.replace(
  /<td className="py-3 px-3\.5 text-xs text-\[var\(--text-primary\)\] align-top font-medium">\s*\{g\.roleTitle\}\s*<\/td>/,
  buttonUI
);

fs.writeFileSync('src/components/GraduateSchemesTab.tsx', content);
console.log("Updated GraduateSchemesTab.tsx table");
