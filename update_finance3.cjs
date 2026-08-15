const fs = require('fs');
let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

const ledgerCard = `
        {/* 4. Settlement Ledger */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border)] flex flex-col h-full lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[var(--text-primary)]">Settlement Ledger</h3>
              <p className="text-xs text-[var(--text-secondary)]">Peer-to-peer split balances</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {/* Compute totals grouped by peer */}
            {(() => {
              const balances = {};
              (userData.expenses || []).forEach(exp => {
                if (exp.splitWith && exp.owedToMe && !exp.settled) {
                  if (!balances[exp.splitWith]) balances[exp.splitWith] = { owedToMe: 0, iOwe: 0, items: [] };
                  balances[exp.splitWith].owedToMe += exp.owedToMe;
                  balances[exp.splitWith].items.push(exp);
                }
              });
              
              const peerNames = Object.keys(balances);
              if (peerNames.length === 0) {
                return <p className="text-sm text-[var(--text-secondary)] italic text-center mt-10">No pending settlements.</p>;
              }
              
              return peerNames.map(peer => (
                <div key={peer} className="p-4 bg-[#1c1c1e] border border-[var(--border)] rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="font-semibold text-sm">{peer}</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">Owes you: {currencySymbol}{balances[peer].owedToMe.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => {
                        const updatedExpenses = (userData.expenses || []).map(exp => {
                          if (exp.splitWith === peer && !exp.settled) return { ...exp, settled: true };
                          return exp;
                        });
                        updateData({ expenses: updatedExpenses });
                        alert('Balances with ' + peer + ' settled!');
                      }}
                      className="flex-1 bg-[var(--text-primary)] text-[var(--bg)] text-xs font-semibold py-2 rounded-lg hover:opacity-90 transition-all"
                    >
                      Settle Up
                    </button>
                    <button 
                      onClick={() => {
                        const text = \`Settlement Summary with \${peer}:\\nTotal Owed: \${currencySymbol}\${balances[peer].owedToMe.toFixed(2)}\\nItems:\\n\` + 
                          balances[peer].items.map(i => \`- \${i.category}: \${currencySymbol}\${i.amount.toFixed(2)} (Your share: \${currencySymbol}\${i.owedToMe.toFixed(2)})\`).join('\\n');
                        navigator.clipboard.writeText(text);
                        alert('Expense split link copied to clipboard!');
                      }}
                      className="flex-1 border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold py-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all flex justify-center items-center gap-2"
                    >
                      <Share2 className="w-3 h-3" /> Export Link
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
`;

code = code.replace(
  `        </div>
      </div>

      {conflictWarning && (`,
  `        </div>
${ledgerCard}
      </div>

      {conflictWarning && (`
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
