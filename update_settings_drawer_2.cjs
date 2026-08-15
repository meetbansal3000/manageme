const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsDrawer.tsx', 'utf8');

const linkedInIndeed = `
          <hr className="border-[var(--border)]" />
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Integrations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#0a66c2]/20 flex items-center justify-center">
                    <span className="font-bold text-[#0a66c2]">in</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">LinkedIn</h4>
                    <p className="text-xs text-emerald-400">Connected</p>
                  </div>
                </div>
                <button className="text-xs font-semibold px-3 py-1.5 bg-white/5 rounded-lg text-gray-300">Disconnect</button>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                    <span className="font-bold text-blue-400">ID</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Indeed</h4>
                    <p className="text-xs text-gray-400">Not connected</p>
                  </div>
                </div>
                <button className="text-xs font-semibold px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg hover:brightness-110">Connect</button>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-[var(--text-secondary)] font-medium">Keep Application Status in Sync</span>
                <button className="w-10 h-6 rounded-full bg-[var(--accent)] relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-5 transition-all"></div>
                </button>
              </div>
            </div>
          </section>
`;

code = code.replace(
  '<hr className="border-[var(--border)]" />',
  linkedInIndeed + '\n          <hr className="border-[var(--border)]" />'
);

fs.writeFileSync('src/components/SettingsDrawer.tsx', code);
