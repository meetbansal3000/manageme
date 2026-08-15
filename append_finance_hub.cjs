const fs = require('fs');
let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

const additionalImports = `
import { MonitorPlay, Car, ChevronDown } from 'lucide-react';
`;

code = code.replace("import { ArrowRightLeft", additionalImports + "\nimport { ArrowRightLeft");

const extraTabsState = `
  const [isSubscriptionsVisible, setIsSubscriptionsVisible] = useState(true);
  const [isVehicleVisible, setIsVehicleVisible] = useState(true);
`;

code = code.replace(
  "const [isOCRVisible, setIsOCRVisible] = useState(true);",
  "const [isOCRVisible, setIsOCRVisible] = useState(true);\n" + extraTabsState
);

const newCards = `
      {/* Subscriptions & Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel border border-[var(--border)] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><MonitorPlay className="w-5 h-5 text-purple-400" /> Subscriptions & Tech Assets</h2>
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
                <div className="flex justify-between items-center p-3 border border-[var(--border)] bg-black/20 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="text-sm">Spotify Premium</span>
                  <span className="text-sm font-bold">£10.99/mo</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-[var(--border)] bg-black/20 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="text-sm">GitHub Copilot</span>
                  <span className="text-sm font-bold">$10.00/mo</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-[var(--border)] bg-black/20 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="text-sm">ChatGPT Plus</span>
                  <span className="text-sm font-bold">$20.00/mo</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel border border-[var(--border)] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Car className="w-5 h-5 text-blue-400" /> Vehicle Ownership Cost Calc</h2>
            <button onClick={() => setIsVehicleVisible(!isVehicleVisible)} className="p-1 hover:bg-white/5 rounded-md text-gray-400">
              <ChevronDown className={\`w-4 h-4 \${isVehicleVisible ? '' : 'rotate-180'}\`} />
            </button>
          </div>
          
          {isVehicleVisible && (
            <div className="space-y-5">
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between p-2 rounded bg-black/20"><span className="text-gray-400 font-medium">Target Vehicle:</span> <span className="font-bold text-white">Audi A4 Avant</span></div>
                <div className="flex justify-between p-2 rounded"><span className="text-gray-400">Monthly Depreciation:</span> <span>£250</span></div>
                <div className="flex justify-between p-2 rounded"><span className="text-gray-400">Insurance (Monthly eq):</span> <span>£80</span></div>
                <div className="flex justify-between p-2 rounded"><span className="text-gray-400">Fuel/EV Charge:</span> <span>£120</span></div>
                <div className="flex justify-between p-2 rounded"><span className="text-gray-400">Tax & MOT:</span> <span>£25</span></div>
              </div>
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-300">Net Monthly Cost</span>
                  <span className="font-bold text-2xl text-red-400">£475</span>
                </div>
                <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg p-3">
                  <p className="text-xs text-[var(--accent)] text-center font-medium">This is £295 more expensive per month compared to your £180 public transit travel pass.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
`;

code = code.replace(
  "    </div>\n  );\n};",
  "      " + newCards + "\n    </div>\n  );\n};"
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
