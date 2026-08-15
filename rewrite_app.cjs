const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will just locate the main <AnimatePresence> block and replace its contents.
const startMarker = '<AnimatePresence mode="wait">';
const endMarker = '</AnimatePresence>';
const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers.");
  process.exit(1);
}

const before = code.substring(0, startIndex + startMarker.length);
const after = code.substring(endIndex);

const newContent = `
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
                    gradSchemes={userData.gradSchemes || []}
                    onUpdateStatus={(id, status) => {
                      updateData({ gradSchemes: (userData.gradSchemes || []).map(s => s.id === id ? { ...s, status } : s) });
                    }}
                    searchQuery={searchQuery}
                    selectedSector={selectedSector}
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
                    priorityItems={userData.priorityItems || []}
                    onUpdateStatus={(id, status) => {
                      updateData({ priorityItems: (userData.priorityItems || []).map(p => p.id === id ? { ...p, status } : p) });
                    }}
                    onUpdateNotes={(id, nextAction, notes) => {
                      updateData({ priorityItems: (userData.priorityItems || []).map(p => p.id === id ? { ...p, nextAction, notes } : p) });
                    }}
                    onAddNewApplication={() => setIsAddModalOpen(true)}
                    searchQuery={searchQuery}
                    selectedSector={selectedSector}
                  />
                  <KeyNotesChecklistTab 
                    notesSections={userData.notesSections || []}
                    onToggleItem={(secId, itemId) => {
                      const newSections = (userData.notesSections || []).map(sec => {
                        if (sec.id === secId) {
                          return {
                            ...sec,
                            items: sec.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
                          };
                        }
                        return sec;
                      });
                      updateData({ notesSections: newSections });
                    }}
                    searchQuery={searchQuery}
                  />
                  <ExtraItemsCard extraItems={userData.extraItems || []} updateData={updateData} />
                </div>
              )}
              
              {activeTab === 'skills' && (
                <SkillsTrackerTab 
                  skills={userData.skillsTracker || []}
                  setSkills={(newSkillsOrFn) => {
                     const nextSkills = typeof newSkillsOrFn === 'function' ? newSkillsOrFn(userData.skillsTracker || []) : newSkillsOrFn;
                     updateData({ skillsTracker: nextSkills });
                  }}
                />
              )}
              
              {activeTab === 'uni' && (
                <UniTimetableTab 
                  userData={userData}
                  updateData={updateData}
                />
              )}
              
            </motion.div>
          `;

fs.writeFileSync('src/App.tsx', before + newContent + after);
