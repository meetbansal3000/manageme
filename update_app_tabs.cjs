const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import { FinancialNewsTab } from './components/FinancialNewsTab';
import { JobSearchTab } from './components/JobSearchTab';
import { TravelTripsTab } from './components/TravelTripsTab';
`;

code = code.replace(
  "import { ExtraItemsCard } from './components/ExtraItemsCard';",
  imports + "\nimport { ExtraItemsCard } from './components/ExtraItemsCard';"
);

// Update initial state to 'news'
code = code.replace(
  "useState<'timeline' | 'grad' | 'parttime' | 'priority' | 'notes' | 'skills' | 'finance' | 'uni'>('timeline')",
  "useState<string>('news')"
);

// Add the new tabs to the render function
const renderTabs = `
        {activeTab === 'news' && <FinancialNewsTab userData={userData} updateData={updateData} />}
        {activeTab === 'jobs' && <JobSearchTab userData={userData} updateData={updateData} />}
        {activeTab === 'travel' && <TravelTripsTab userData={userData} updateData={updateData} />}
        {activeTab === 'timeline' && <TimelineTab timeline={userData.timeline || []} updateData={updateData} />}
`;

code = code.replace(
  "{activeTab === 'timeline' && <TimelineTab timeline={userData.timeline || []} updateData={updateData} />}",
  renderTabs
);

fs.writeFileSync('src/App.tsx', code);
