const fs = require('fs');
let content = fs.readFileSync('src/components/GeminiDrawer.tsx', 'utf8');

content = content.replace("import { GoogleGenAI } from '@google/genai';", "");

content = content.replace("interface GeminiDrawerProps {\n  trackerContext: any; // Context payload to inject\n}",
`interface GeminiDrawerProps {
  trackerContext: any;
  onMutateState?: (mutations: any) => void;
}`);

content = content.replace("export const GeminiDrawer: React.FC<GeminiDrawerProps> = ({ trackerContext }) => {",
"export const GeminiDrawer: React.FC<GeminiDrawerProps> = ({ trackerContext, onMutateState }) => {");

const handleSendBlock = `  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!settings.geminiApiKey) {
      setMessages(prev => [...prev, 
        { role: 'user', text: input },
        { role: 'model', text: 'Please configure your Gemini API Key in the Settings panel (gear icon) first.' }
      ]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    await withSafeExecution('Gemini_Generate', async () => {
      const response = await fetch('/api/chat-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${settings.geminiApiKey}\`
        },
        body: JSON.stringify({
          message: userMessage,
          trackerContext: trackerContext
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      }
      
      if (data.mutations && onMutateState) {
        onMutateState(data.mutations);
      }
    });

    setIsLoading(false);
  };`;

// Replace handleSend logic
const oldHandleSendRegex = /const handleSend = async \(\) => \{[\s\S]*?setIsLoading\(false\);\n  \};/;
content = content.replace(oldHandleSendRegex, handleSendBlock);

fs.writeFileSync('src/components/GeminiDrawer.tsx', content);
