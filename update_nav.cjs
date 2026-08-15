const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const newNavItems = `
  const navItems = [
    { id: 'news', label: 'News & Intel' },
    { id: 'jobs', label: 'Job Search' },
    { id: 'timeline', label: 'Dashboard' },
    { id: 'finance', label: 'Finance Hub' },
    { id: 'travel', label: 'Trips & Transit' },
    { id: 'notes', label: 'Checklist' },
    { id: 'uni', label: 'Timetable' },
  ] as const;
`;

code = code.replace(
  /const navItems = \[[\s\S]*?\] as const;/g,
  newNavItems.trim()
);

fs.writeFileSync('src/components/Header.tsx', code);
