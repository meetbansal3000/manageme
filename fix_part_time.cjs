const fs = require('fs');
let code = fs.readFileSync('src/components/PartTimeRolesTab.tsx', 'utf8');

code = code.replace(
  "description={shift.description}\n                        description=\"Part-time work shift\"",
  "title={shift.description || 'Work Shift'}\n                        description=\"Part-time work shift\""
);

// also fix missing 'hours'
code = code.replace(
  "endTime: newShift.endTime || '17:00',",
  "endTime: newShift.endTime || '17:00',\n      hours: calculateHours(newShift.startTime || '09:00', newShift.endTime || '17:00'),"
);

fs.writeFileSync('src/components/PartTimeRolesTab.tsx', code);
