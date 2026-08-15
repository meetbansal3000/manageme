const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// imports
app = app.replace("import { DebugConsole } from './components/DebugConsole';", "import { DebugConsole } from './components/DebugConsole';\nimport { ActivityDrawer } from './components/ActivityDrawer';");

// state
app = app.replace("const [isAddModalOpen, setIsAddModalOpen] = useState(false);", "const [isAddModalOpen, setIsAddModalOpen] = useState(false);\n  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);");

// header prop
app = app.replace("onOpenSettings={() => setIsSettingsOpen(true)}", "onOpenSettings={() => setIsSettingsOpen(true)}\n        onOpenActivityDrawer={() => setIsActivityDrawerOpen(true)}");

// drawer render
const drawerStr = `
      <ActivityDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        userData={userData}
      />
`;
app = app.replace("      <DebugConsole />", "      <DebugConsole />\n" + drawerStr);

fs.writeFileSync('src/App.tsx', app);
