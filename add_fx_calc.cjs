const fs = require('fs');
let code = fs.readFileSync('src/components/FinancialNewsTab.tsx', 'utf8');

const fxCalc = `
        {/* FX Calculator Widget */}
        <div className="space-y-6">
          <div className="glass-panel border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              FX Quick Calc
            </h3>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="100" className="w-full bg-black/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
              <select className="bg-black/20 border border-[var(--border)] rounded-lg px-2 py-2 text-sm">
                <option>GBP</option>
                <option>USD</option>
                <option>EUR</option>
                <option>INR</option>
              </select>
            </div>
            <div className="flex items-center justify-center text-gray-500">
              <TrendingUp className="w-4 h-4 rotate-90" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-bold text-gray-300">
                128.50
              </div>
              <select className="bg-black/20 border border-[var(--border)] rounded-lg px-2 py-2 text-sm">
                <option>USD</option>
                <option>GBP</option>
                <option>EUR</option>
                <option>INR</option>
              </select>
            </div>
          </div>
`;

code = code.replace(
  "        <div className=\"space-y-6\">",
  fxCalc
);

fs.writeFileSync('src/components/FinancialNewsTab.tsx', code);
