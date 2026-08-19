const fs = require('fs');
let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

const pickerFn = `
  const handleDrivePicker = async () => {
    const token = await getAccessToken();
    if (!token) {
      alert("Please sign in to Google to use Drive Picker.");
      return;
    }
    
    // Load the Picker API
    const loadScript = (url: string) => new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

    try {
      if (!(window as any).google?.picker) {
        await loadScript('https://apis.google.com/js/api.js');
        await new Promise((resolve) => (window as any).gapi.load('picker', resolve));
      }
      
      const picker = new (window as any).google.picker.PickerBuilder()
        .addView((window as any).google.picker.ViewId.DOCS)
        .setDeveloperKey(process.env.VITE_GOOGLE_MAPS_API_KEY || "") // Configured via VITE_GOOGLE_MAPS_API_KEY
          if (data.action === (window as any).google.picker.Action.PICKED) {
            const file = data.docs[0];
            alert(\`Selected file from Drive: \${file.name} (ID: \${file.id})\`);
            // Here we could fetch the file content using the file ID and Drive API
          }
        })
        .build();
        
      picker.setVisible(true);
    } catch (e) {
      console.error(e);
      alert('Failed to load Google Picker.');
    }
  };
`;

code = code.replace("  const handleReceiptUpload", pickerFn + "\n  const handleReceiptUpload");

const pickerBtn = `
                  <button onClick={handleDrivePicker} className="flex items-center gap-2 px-3 py-1.5 rounded-md glass-panel border border-[var(--border)] text-sm font-medium hover:bg-white/5 transition-colors">
                    <Upload className="w-4 h-4" /> Pick from Drive
                  </button>
`;

code = code.replace(
  `<button onClick={() => fileInputRef.current?.click()}`,
  pickerBtn + `\n                  <button onClick={() => fileInputRef.current?.click()}`
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
