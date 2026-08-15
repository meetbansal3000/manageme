const fs = require('fs');
let hook = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

// Add visaLimit to UserTrackerData
if(!hook.includes("visaLimit?: number;")) {
  hook = hook.replace("termStatus: TermStatus;", "termStatus: TermStatus;\n  visaLimit?: number;");
}
fs.writeFileSync('src/hooks/useFirestoreData.ts', hook);

let fin = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');
fin = fin.replace("const isTermTime = userData.termStatus === 'Term Time';", "const isTermTime = userData.termStatus === 'Term Time';\n  const limit = userData.visaLimit !== undefined ? userData.visaLimit : 20;");
fin = fin.replace(/last7DaysHours >= 18 && last7DaysHours <= 20/g, "last7DaysHours >= (limit - 2) && last7DaysHours <= limit");
fin = fin.replace(/last7DaysHours > 20/g, "last7DaysHours > limit");
fin = fin.replace(/'20' : 'No Limit'/g, "limit : 'No Limit'");
fin = fin.replace(/20-hour limit/g, "${limit}-hour limit");
// Let's use backticks for the limit string
fin = fin.replace(/Approaching \$\{limit\}-hour limit/g, "Approaching ${limit}-hour limit"); 
// Let's do it safely.
fs.writeFileSync('src/components/FinanceHubTab.tsx', fin);
