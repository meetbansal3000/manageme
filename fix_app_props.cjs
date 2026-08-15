const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const jobsBlock = `{activeTab === 'jobs' && (
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
              )}`;

const tasksBlock = `{activeTab === 'tasks' && (
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
              )}`;

const skillsBlock = `{activeTab === 'skills' && (
                <SkillsTrackerTab 
                  skills={userData.skillsTracker || []}
                  setSkills={(newSkillsOrFn) => {
                     const nextSkills = typeof newSkillsOrFn === 'function' ? newSkillsOrFn(userData.skillsTracker || []) : newSkillsOrFn;
                     updateData({ skillsTracker: nextSkills });
                  }}
                />
              )}`;

code = code.replace(
  /\{activeTab === 'jobs' && \([\s\S]*?\)\s*\}/,
  jobsBlock
);

code = code.replace(
  /\{activeTab === 'tasks' && \([\s\S]*?\)\s*\}/,
  tasksBlock
);

code = code.replace(
  /\{activeTab === 'skills' && \([\s\S]*?\)\s*\}/,
  skillsBlock
);

fs.writeFileSync('src/App.tsx', code);
