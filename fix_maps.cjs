const fs = require('fs');

const fixApp = () => {
  let content = fs.readFileSync('src/App.tsx', 'utf8');
  content = content.replace(
    '...userData.gradSchemes.map(s => s.sector)',
    '...((userData && userData.gradSchemes) || []).map(s => s.sector)'
  );
  content = content.replace(
    '...userData.partTimeRoles.map(r => r.sector)',
    '...((userData && userData.partTimeRoles) || []).map(r => r.sector)'
  );
  fs.writeFileSync('src/App.tsx', content);
};

const fixFinance = () => {
  let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');
  content = content.replace(
    'userData.workShifts.reduce',
    '(userData.workShifts || []).reduce'
  );
  content = content.replace(
    'userData.expenses.reduce',
    '(userData.expenses || []).reduce'
  );
  content = content.replace(
    'userData.creditCards.reduce',
    '(userData.creditCards || []).reduce'
  );
  content = content.replace(
    'userData.invoices.reduce',
    '(userData.invoices || []).reduce'
  );
  
  content = content.replace(
    'userData.creditCards.map',
    '(userData.creditCards || []).map'
  );
  content = content.replace(
    'userData.workShifts.map',
    '(userData.workShifts || []).map'
  );
  content = content.replace(
    'userData.expenses.map',
    '(userData.expenses || []).map'
  );
  content = content.replace(
    'userData.creditCards.map',
    '(userData.creditCards || []).map'
  );
  content = content.replace(
    'userData.invoices.map',
    '(userData.invoices || []).map'
  );
  content = content.replace(
    'userData.uniClasses.filter',
    '(userData.uniClasses || []).filter'
  );
  
  fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
};

const fixTimetable = () => {
  let content = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');
  content = content.replace(
    'userData.uniClasses\n            .filter',
    '(userData.uniClasses || [])\n            .filter'
  );
  content = content.replace(
    'userData.uniClasses.filter',
    '(userData.uniClasses || []).filter'
  );
  fs.writeFileSync('src/components/UniTimetableTab.tsx', content);
};

try {
  fixApp();
  fixFinance();
  fixTimetable();
  console.log("Fixed all maps");
} catch (e) {
  console.error(e);
}
