const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace('properties: {', 
  `properties: {`);

// ensure we define the exact prompt structure so Gemini knows how to mutate.
const newPrompt = `
You are an expert career and learning assistant for Meet Bansal.
You have the ability to read the user's current app state and optionally modify it.
Here is the current state of their workspace tracker:
\${JSON.stringify(trackerContext, null, 2)}

User's Request: "\${message}"

Respond concisely. If the user's request involves mutating the state (e.g., updating visa hours, adding an expense, checking off a task, setting term time), you must return a "mutations" object containing the partial UserTrackerData to merge into the user's state. If no mutation is needed, leave "mutations" null.

Important Schema Mappings for Mutations:
- Visa limit: { "visaLimit": number }
- Term Status: { "termStatus": "Term Time" | "Vacation" }
- Expenses: { "expenses": [ ...existing ones, new expense ] } (append new expense to the provided expenses list)
- Work Shifts: { "workShifts": [ ...existing ones, new shift ] } (append to list)

Do NOT hallucinate ID values, reuse the ones from the context when modifying existing arrays, or generate new ones (Date.now().toString()) for new items.
Return JSON ONLY.\`;`;

server = server.replace(/const contextPrompt = `[^`]*`;/, `const contextPrompt = \`${newPrompt}`);
fs.writeFileSync('server.ts', server);
