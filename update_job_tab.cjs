const fs = require('fs');

let code = fs.readFileSync('src/components/JobSearchTab.tsx', 'utf8');

// Add AddToCalendar import
code = code.replace(
  "import { JobApplication, JobPreferences } from '../types';",
  "import { JobApplication, JobPreferences } from '../types';\nimport { AddToCalendar } from './AddToCalendar';"
);

// Add deadline to the rendered application card
code = code.replace(
  "<p className=\"text-xs text-gray-400\">{app.company}</p>",
  "<p className=\"text-xs text-gray-400\">{app.company}</p>\n                      {app.deadline && (\n                        <div className=\"pt-1\">\n                          <AddToCalendar \n                            title={`Deadline: ${app.title} at ${app.company}`} \n                            startDate={`${app.deadline}T09:00:00`}\n                          />\n                        </div>\n                      )}"
);

fs.writeFileSync('src/components/JobSearchTab.tsx', code);
