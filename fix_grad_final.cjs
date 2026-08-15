const fs = require('fs');
let content = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

const badBlock = `  const filtered = gradSchemes.filter(g => {
    if (selectedSector !== 'ALL' && g.sector !== selectedSector) return false;
    if (selectedDifficulty !== 'ALL' && g.difficulty !== selectedDifficulty) return false;
    if (selectedRisk !== 'ALL' && g.filterRisk !== selectedRisk) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const [pitchData, setPitchData] = useState<{ [key: string]: string[] }>({});
  const [loadingPitch, setLoadingPitch] = useState<string | null>(null);

  const handleGeneratePitch = async (id: string, firm: string, role: string) => {
    setLoadingPitch(id);
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firm,
          role,
          skills: ['ACCA', 'CFA', 'Excel', 'IFRS'] // Mock active skills for now
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPitchData(prev => ({ ...prev, [id]: data.bullets }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingPitch(null);
    }
  };

  return (
      g.firm.toLowerCase().includes(q) ||
      g.roleTitle.toLowerCase().includes(q) ||
      g.sector.toLowerCase().includes(q) ||
      g.notes.toLowerCase().includes(q) ||
      g.salary.toLowerCase().includes(q)
    );
  });`;

const newBlock = `  const filtered = gradSchemes.filter(g => {
    if (selectedSector !== 'ALL' && g.sector !== selectedSector) return false;
    if (selectedDifficulty !== 'ALL' && g.difficulty !== selectedDifficulty) return false;
    if (selectedRisk !== 'ALL' && g.filterRisk !== selectedRisk) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    return (
      g.firm.toLowerCase().includes(q) ||
      g.roleTitle.toLowerCase().includes(q) ||
      g.sector.toLowerCase().includes(q) ||
      g.notes.toLowerCase().includes(q) ||
      g.salary.toLowerCase().includes(q)
    );
  });`;

content = content.replace(badBlock, newBlock);
fs.writeFileSync('src/components/GraduateSchemesTab.tsx', content);
