const fs = require('fs');
let code = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

if (!code.includes("extraItems: any[];")) {
  code = code.replace(
    "export interface UserTrackerData {",
    "export interface UserTrackerData {\n  extraItems: any[];"
  );
}
if (!code.includes("extraItems: [],")) {
  code = code.replace(
    "profileSummary: '',",
    "profileSummary: '',\n  extraItems: [],"
  );
}

fs.writeFileSync('src/hooks/useFirestoreData.ts', code);
