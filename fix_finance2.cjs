const fs = require('fs');
let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

if (!content.includes('isVisaExceeded && (')) {
  const warningUI = `
            {isVisaExceeded && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">
                  Visa limit exceeded! You have logged more than 20 hours this week.
                </p>
              </div>
            )}
`;
  content = content.replace('{isVisaWarning && (', warningUI + '\n            {isVisaWarning && (');
}

fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
