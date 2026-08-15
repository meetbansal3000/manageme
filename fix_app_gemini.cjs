const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Insert handleGeminiMutate
const handleMutate = `
  const handleGeminiMutate = (mutations: any) => {
    updateData(mutations);
    const details = Object.keys(mutations).join(', ');
    setGeminiToast(\`\u2728 Gemini updated your settings: \${details}\`);
    setTimeout(() => setGeminiToast(null), 5000);
  };
`;
app = app.replace("  const [isInterviewOpen, setIsInterviewOpen] = useState(false);", "  const [isInterviewOpen, setIsInterviewOpen] = useState(false);\n" + handleMutate);

fs.writeFileSync('src/App.tsx', app);
