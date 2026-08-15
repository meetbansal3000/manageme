const fs = require('fs');
let content = fs.readFileSync('src/components/MorningBriefing.tsx', 'utf8');

content = content.replace(
  "import { Sparkles } from 'lucide-react';",
  "import { Sparkles, Loader2, Bot } from 'lucide-react';\nimport { useState } from 'react';"
);

// We need to add state for the AI strategy.
const aiLogic = `
  const [strategy, setStrategy] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeWeek = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const last7DaysHours = (userData.workShifts || []).filter(s => {
        const d = new Date(s.date);
        return (today.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000 && d <= today;
      }).reduce((sum, s) => sum + s.hours, 0);
      const visaRemaining = Math.max(0, 20 - last7DaysHours);

      const response = await fetch('/api/analyze-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classes: userData.uniClasses,
          shifts: userData.workShifts,
          deadlines: userData.priorityItems,
          visaRemaining
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.strategy) setStrategy(data.strategy);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };
`;

content = content.replace(
  "export const MorningBriefing: React.FC<{ userData: UserTrackerData }> = ({ userData }) => {",
  "export const MorningBriefing: React.FC<{ userData: UserTrackerData }> = ({ userData }) => {" + aiLogic
);

const buttonUI = `
        <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
          <button 
            onClick={handleAnalyzeWeek}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-colors whitespace-nowrap justify-center"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
            Analyze My Week with AI
          </button>
        </div>
`;

content = content.replace(
  "        </div>\n      </div>",
  "        </div>\n" + buttonUI + "\n      </div>"
);

const strategyUI = `
      {strategy && (
        <div className="mt-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 animate-fade-in">
          <h4 className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3"/> AI Week Strategy</h4>
          <ol className="list-decimal list-inside text-xs text-[var(--text-secondary)] space-y-1">
            {strategy.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
`;

content = content.replace(
  "      </div>\n    </div>",
  strategyUI + "\n      </div>\n    </div>"
);

fs.writeFileSync('src/components/MorningBriefing.tsx', content);
console.log("Updated MorningBriefing.tsx");
