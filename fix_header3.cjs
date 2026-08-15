const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Remove Profile Summary Ribbon
content = content.replace(
  /\{\/\* Profile Summary Ribbon \*\/\}[\s\S]*?<\/div>\n      <\/div>/,
  ""
);

// Add compact profile badge to Header
const profileBadge = `
              <span className="font-semibold text-[var(--text-primary)] tracking-tight hidden sm:block">
                {userName}'s Tracker
              </span>
              {userData.profileSummary && (
                <div className="hidden lg:block ml-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                  <span className="text-[11px] text-[var(--text-secondary)] max-w-[300px] truncate block">
                    {userData.profileSummary}
                  </span>
                </div>
              )}
`;
content = content.replace(
  /<span className="font-semibold text-\[var\(--text-primary\)\] tracking-tight hidden sm:block">\s*\{userName\}'s Tracker\s*<\/span>/,
  profileBadge
);

fs.writeFileSync('src/components/Header.tsx', content);
console.log("Updated Header.tsx with compact profile!");
