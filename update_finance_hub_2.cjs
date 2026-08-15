const fs = require('fs');
let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

const newCards = `
        {/* Subscriptions & Assets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel border border-[var(--border)] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><MonitorPlay className="w-5 h-5 text-purple-400" /> Subscriptions & Tech</h2>
              <button onClick={() => setIsSubscriptionsVisible(!isSubscriptionsVisible)} className="p-1 hover:bg-white/5 rounded-md text-gray-400">
                <ChevronDown className={\`w-4 h-4 \${isSubscriptionsVisible ? '' : 'rotate-180'}\`} />
              </button>
            </div>
            
            {isSubscriptionsVisible && (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-red-400">UPCOMING RENEWAL (3 Days)</span>
                    <p className="text-sm font-bold mt-1">Adobe Creative Cloud</p>
                  </div>
                  <span className="font-bold">£49.99</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                    <span className="text-sm">Spotify Premium</span>
                    <span className="text-sm font-bold">£10.99/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                    <span className="text-sm">GitHub Copilot</span>
                    <span className="text-sm font-bold">$10.00/mo</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel border border-[var(--border)] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Car className="w-5 h-5 text-blue-400" /> Vehicle Cost Calc</h2>
              <button onClick={() => setIsVehicleVisible(!isVehicleVisible)} className="p-1 hover:bg-white/5 rounded-md text-gray-400">
                <ChevronDown className={\`w-4 h-4 \${isVehicleVisible ? '' : 'rotate-180'}\`} />
              </button>
            </div>
            
            {isVehicleVisible && (
              <div className="space-y-4">
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between"><span className="text-gray-400">Target Vehicle:</span> <span>Audi A4 Avant</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Depreciation:</span> <span>£250/mo</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Insurance:</span> <span>£80/mo</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Fuel/EV Charge:</span> <span>£120/mo</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Tax & MOT:</span> <span>£25/mo</span></div>
                </div>
                <div className="pt-3 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-300">Net Monthly Cost</span>
                    <span className="font-bold text-xl text-red-400">£475</span>
                  </div>
                  <p className="text-xs text-orange-400 mt-2 text-right">vs £180/mo public transit pass</p>
                </div>
              </div>
            )}
          </div>
        </div>
`;

code = code.replace(
  "        {/* End of Left Column */}", // Wait, I need a reliable anchor in FinanceHubTab.tsx to append these cards.
  "        {/* End of Left Column */}"
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
