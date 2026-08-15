const fs = require('fs');

// FinanceHubTab.tsx (WorkShifts, Expenses, Invoices)
let fin = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');
fin = fin.replace(
  /const shift: WorkShift = \{ id: Date\.now\(\)\.toString\(\), \.\.\.newShift \};/,
  'const shift: WorkShift = { id: Date.now().toString(), ...newShift, timestamp: Date.now() };'
);
fin = fin.replace(
  /const expense: Expense = \{ id: Date\.now\(\)\.toString\(\), \.\.\.newExpense, amount: Number\(newExpense\.amount\) \};/,
  'const expense: Expense = { id: Date.now().toString(), ...newExpense, amount: Number(newExpense.amount), timestamp: Date.now() };'
);
fs.writeFileSync('src/components/FinanceHubTab.tsx', fin);

// SkillsTrackerTab.tsx (SkillTask)
let skills = fs.readFileSync('src/components/SkillsTrackerTab.tsx', 'utf8');
skills = skills.replace(
  /const newTask: SkillTask = \{\s*id: Date\.now\(\)\.toString\(\),\s*\.\.\.formData,\s*status: 'Not Started'\s*\};/g,
  "const newTask: SkillTask = { id: Date.now().toString(), ...formData, status: 'Not Started', timestamp: Date.now() };"
);
fs.writeFileSync('src/components/SkillsTrackerTab.tsx', skills);

// UniTimetableTab.tsx (UniClass)
let uni = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');
uni = uni.replace(
  /const newClassObj: UniClass = \{ id: Date\.now\(\)\.toString\(\), \.\.\.newClass \};/g,
  "const newClassObj: UniClass = { id: Date.now().toString(), ...newClass, timestamp: Date.now() };"
);
fs.writeFileSync('src/components/UniTimetableTab.tsx', uni);

