const fs = require('fs');
let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

content = content.replace(
  "import { DollarSign, Clock, AlertTriangle, Wallet, CreditCard as CardIcon, Receipt, Upload, Trash2, Plus, Download } from 'lucide-react';",
  "import { DollarSign, Clock, AlertTriangle, Wallet, CreditCard as CardIcon, Receipt, Upload, Trash2, Plus, Download, Loader2, Bot } from 'lucide-react';"
);

// Add loading state
content = content.replace(
  "const [conflictWarning, setConflictWarning] = useState<string | null>(null);",
  "const [conflictWarning, setConflictWarning] = useState<string | null>(null);\n  const [isParsingReceipt, setIsParsingReceipt] = useState(false);"
);

// Rewrite handleFileUpload
const uploadLogic = `
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsParsingReceipt(true);
    try {
      // 1. Read file as base64 for local storage (invoice archive)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const invoiceId = Date.now().toString();
        localStorage.setItem(\`invoice_file_\${invoiceId}\`, base64);
        
        // 2. Send to Gemini OCR API
        const formData = new FormData();
        formData.append('receipt', file);
        
        const response = await fetch('/api/parse-receipt', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to parse receipt');
        }
        
        const data = await response.json();
        
        // 3. Create Invoice Record
        const newInvoice: Invoice = {
          id: invoiceId,
          vendor: data.merchant || file.name.split('.')[0] || 'Unknown',
          date: data.date || new Date().toISOString().split('T')[0],
          amount: data.amount || 0,
          fileType: file.type
        };
        
        // 4. Auto-log as expense
        const newExp: Expense = {
          id: Date.now().toString() + 'exp',
          category: (data.category as any) || 'Other',
          amount: data.amount || 0,
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.merchant || 'Auto-parsed receipt'
        };
        
        updateData({ 
          invoices: [newInvoice, ...(userData.invoices || [])],
          expenses: [newExp, ...(userData.expenses || [])]
        });
        
        alert(\`Receipt parsed successfully! Logged £\${newExp.amount} at \${newExp.description}.\`);
        setIsParsingReceipt(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message);
      setIsParsingReceipt(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
`;

content = content.replace(
  /const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(fileInputRef\.current\) fileInputRef\.current\.value = '';\n  \};/,
  uploadLogic
);

// Update UI
const uploadUI = `
              <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer relative overflow-hidden" onClick={() => !isParsingReceipt && fileInputRef.current?.click()}>
                {isParsingReceipt ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Gemini is extracting data...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                      <Bot className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">AI Receipt Scanner</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Upload Receipt. Auto-logs to Expense Hub.</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} disabled={isParsingReceipt} />
              </div>
`;

content = content.replace(
  /<div className="border-2 border-dashed border-\[var\(--border\)\] rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-\[rgba\(255,255,255,0\.02\)\] transition-colors cursor-pointer" onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}>[\s\S]*?<\/div>/,
  uploadUI
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
console.log("Updated FinanceHubTab.tsx");
