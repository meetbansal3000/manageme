const fs = require('fs');

let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

// Ensure term time toggle exists
if (!content.includes('isTermTime')) {
  const insertState = `
  const [isTermTime, setIsTermTime] = useState(true);
  const visaLimit = isTermTime ? 20 : 999;
  const isVisaWarning = last7DaysHours >= 18 && last7DaysHours <= 20;
  const isVisaExceeded = last7DaysHours > 20;
  const visaUsagePercent = Math.min(100, (last7DaysHours / (isTermTime ? 20 : 40)) * 100);
`;
  content = content.replace('  const visaLimit = 20;\n  const isVisaWarning = last7DaysHours > visaLimit * 0.8;\n  const visaUsagePercent = Math.min(100, (last7DaysHours / visaLimit) * 100);', insertState);
}

// Ensure receipt parsing exists
if (!content.includes('handleReceiptUpload')) {
  const uploadInsert = `
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsParsingReceipt(true);
    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to parse receipt');
      const data = await response.json();
      
      setNewExpense({
        category: data.category || 'Food',
        amount: data.amount ? String(data.amount) : '',
        date: data.date || new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(err);
      alert('Error parsing receipt');
    } finally {
      setIsParsingReceipt(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
`;
  content = content.replace('  const totalHours =', uploadInsert + '\n  const totalHours =');
}

// Let's add the UI for term time toggle
const termUI = `
          <div className="flex items-center justify-between mt-4 border-t border-[var(--border)] pt-4">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Term-Time (Visa Limit Active)</span>
            <button
              onClick={() => setIsTermTime(!isTermTime)}
              className={\`w-10 h-6 rounded-full transition-colors relative \${isTermTime ? 'bg-[var(--accent)]' : 'bg-[rgba(128,128,128,0.2)]'}\`}
            >
              <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${isTermTime ? 'left-5' : 'left-1'}\`}></div>
            </button>
          </div>
`;
content = content.replace('{isVisaWarning && (', termUI + '\n            {isVisaWarning && (');
content = content.replace('{isVisaExceeded && (', termUI + '\n            {isVisaExceeded && ('); // just in case

// Fix visa warning styling based on new logic
content = content.replace('bg-red-500', "bg-amber-500");
content = content.replace("Approaching legal visa limits.", "Warning: Approaching 20-hour limit.");
content = content.replace("isVisaWarning ? 'bg-amber-500' : 'bg-emerald-500'", "isVisaExceeded ? 'bg-red-500' : isVisaWarning ? 'bg-amber-500' : 'bg-emerald-500'");
content = content.replace("last7DaysHours.toFixed(1)} / {visaLimit} hrs", "last7DaysHours.toFixed(1)} / {isTermTime ? '20' : 'No Limit'} hrs");

// Update input ref for receipt parsing
content = content.replace('<input type="file" ref={fileInputRef} className="hidden" accept="image/*" />', '<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleReceiptUpload} />');
content = content.replace('<button className="flex items-center', '<button onClick={() => fileInputRef.current?.click()} disabled={isParsingReceipt} className="flex items-center');

fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
