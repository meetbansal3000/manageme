const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { TravelTripsTab } from './components/TravelTripsTab';",
  "import { TravelTripsTab } from './components/TravelTripsTab';\nimport { PaperTradingTab } from './components/PaperTradingTab';"
);

// We need to replace the activeTab types in the state.
// Current: const [activeTab, setActiveTab] = useState<string>('news'); -> should still be fine since string is string
// Wait, we need to map the new tab IDs to the components.
// 'news' -> <FinancialNewsTab ... />
// 'jobs' -> <JobSearchTab ... /> and maybe <GraduateSchemesTab ... />
// 'work' -> <PartTimeRolesTab ... />
// 'trading' -> <PaperTradingTab ... />
// 'travel' -> <TravelTripsTab ... activeView='trips'/> (if that prop exists, else just the component)
// 'transit' -> <TravelTripsTab ... activeView='transit'/>
// 'finance' -> <FinanceHubTab ... />
// 'tasks' -> <PriorityTrackerTab ... /> + <KeyNotesChecklistTab ... />
// 'skills' -> <SkillsTrackerTab ... />
// 'uni' -> <UniTimetableTab ... />
// 'places' -> <TravelTripsTab ... activeView='places'/>

const oldRenderBlockStart = '{activeTab === \'timeline\' && (';

// Find the start of the `<main` component rendering
const mainStartRegex = /<main[^>]*>/;
const mainStartMatch = code.match(mainStartRegex);

if (mainStartMatch) {
  const parts = code.split(mainStartMatch[0]);
  const preMain = parts[0] + mainStartMatch[0] + '\n        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">\n';
  
  // Need to extract the closing of main and all moduls
  const postMainIndex = parts[1].indexOf('</main>');
  const postMain = parts[1].substring(postMainIndex);
  
  const newRenderLogic = `          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'news' && <FinancialNewsTab userData={userData} updateData={updateData} />}
              
              {activeTab === 'jobs' && (
                <div className="space-y-8">
                  <JobSearchTab userData={userData} updateData={updateData} />
                  <GraduateSchemesTab 
                    schemes={userData.graduateSchemes} 
                    updateScheme={(id, data) => {
                      updateData({ graduateSchemes: userData.graduateSchemes.map(s => s.id === id ? { ...s, ...data } : s) });
                    }}
                    deleteScheme={(id) => {
                      updateData({ graduateSchemes: userData.graduateSchemes.filter(s => s.id !== id) });
                    }}
                  />
                </div>
              )}
              
              {activeTab === 'work' && (
                <PartTimeRolesTab 
                  roles={userData.partTimeRoles}
                  shifts={userData.workShifts}
                  updateData={updateData}
                />
              )}
              
              {activeTab === 'trading' && <PaperTradingTab userData={userData} updateData={updateData} />}
              
              {(activeTab === 'travel' || activeTab === 'transit' || activeTab === 'places') && (
                <TravelTripsTab 
                  userData={userData} 
                  updateData={updateData}
                />
              )}
              
              {activeTab === 'finance' && <FinanceHubTab userData={userData} updateData={updateData} />}
              
              {activeTab === 'tasks' && (
                <div className="space-y-8">
                  <PriorityTrackerTab 
                    tasks={userData.priorityTasks}
                    updateData={updateData}
                  />
                  <KeyNotesChecklistTab 
                    notes={userData.notes}
                    updateData={updateData}
                  />
                  <ExtraItemsCard extraItems={userData.extraItems || []} updateData={updateData} />
                </div>
              )}
              
              {activeTab === 'skills' && (
                <SkillsTrackerTab 
                  skills={userData.skillsTracker}
                  updateData={updateData}
                />
              )}
              
              {activeTab === 'uni' && (
                <UniTimetableTab 
                  classes={userData.uniClasses}
                  updateData={updateData}
                />
              )}
              
            </motion.div>
          </AnimatePresence>
`;
  code = preMain + newRenderLogic + '        ' + postMain;
  fs.writeFileSync('src/App.tsx', code);
}
