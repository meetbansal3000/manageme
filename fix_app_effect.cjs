const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const buggyBlock = `  useEffect(() => {
    if (loading) return;
    
    useEffect(() => {
    if (loading) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {`;

const fixedBlock = `  useEffect(() => {
    if (loading) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {`;

content = content.replace(buggyBlock, fixedBlock);

fs.writeFileSync('src/App.tsx', content);
