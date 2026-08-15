const fs = require('fs');

let code = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');

code = code.replace(
  "import { UniClass } from '../types';",
  "import { UniClass } from '../types';\nimport { AddToCalendar } from './AddToCalendar';"
);

// Add helper function to the component
code = code.replace(
  "const handleNotesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {",
  `const getNextDateForDay = (dayName: string, timeStr: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const target = days.indexOf(dayName);
    const d = new Date();
    const currentDay = d.getDay();
    let distance = target - currentDay;
    if (distance < 0) distance += 7;
    d.setDate(d.getDate() + distance);
    const dateStr = d.toISOString().split('T')[0];
    return \`\${dateStr}T\${timeStr}:00\`;
  };

  const handleNotesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {`
);

// Insert into class card
code = code.replace(
  "<div className=\"text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mb-2\">",
  "<div className=\"mt-2 mb-2\">\n                    <AddToCalendar title={c.moduleName} location={c.location} startDate={getNextDateForDay(c.dayOfWeek, c.startTime)} endDate={getNextDateForDay(c.dayOfWeek, c.endTime)} />\n                  </div>\n                  <div className=\"text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mb-2\">"
);

fs.writeFileSync('src/components/UniTimetableTab.tsx', code);
