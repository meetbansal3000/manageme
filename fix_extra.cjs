const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { ExtraItemsCard }")) {
  code = code.replace(
    "import { DebugConsole } from './components/DebugConsole';",
    "import { DebugConsole } from './components/DebugConsole';\nimport { ExtraItemsCard } from './components/ExtraItemsCard';\nimport { SmartImportModal } from './components/SmartImportModal';"
  );
}

const renderModals = `
      <SmartImportModal 
        isOpen={isSmartImportOpen} 
        onClose={() => setIsSmartImportOpen(false)}
        userData={userData}
        updateData={updateData}
      />
      
      {userData.extraItems && userData.extraItems.length > 0 && (
        <ExtraItemsCard 
          items={userData.extraItems}
          updateData={updateData}
          userData={userData}
        />
      )}
`;

if (!code.includes("isSmartImportOpen")) {
  code = code.replace(
    "const [isInterviewOpen, setIsInterviewOpen] = useState(false);",
    "const [isInterviewOpen, setIsInterviewOpen] = useState(false);\n  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);"
  );
}

// Add SmartImport to header props
if (!code.includes("onOpenSmartImport")) {
  code = code.replace(
    "onOpenSettings={() => setIsSettingsOpen(true)}",
    "onOpenSettings={() => setIsSettingsOpen(true)}\n          onOpenSmartImport={() => setIsSmartImportOpen(true)}"
  );
}

code = code.replace(
  "{isGoogleModalOpen && (",
  renderModals + "\n      {isGoogleModalOpen && ("
);

fs.writeFileSync('src/App.tsx', code);
