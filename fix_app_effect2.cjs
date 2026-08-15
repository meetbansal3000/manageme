const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// I want to clean up the useEffect. Let's just find the whole useEffect and rewrite it properly.
const startIdx = content.indexOf('useEffect(() => {');
const endIdx = content.indexOf('  }, [loading, activeTab]);'); // Find where it closes

if (startIdx !== -1 && endIdx !== -1) {
  const cleanEffect = `useEffect(() => {
    if (loading) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('globalSearchInput')?.focus();
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setQuickLog('expense');
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setQuickLog('shift');
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const btn = document.getElementById('geminiAssistantBtn');
        if (btn) btn.click();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Slight delay to ensure DOM is ready for GSAP
    const timer = setTimeout(() => {
      const cards = gsap.utils.toArray('.glass-panel');
      cards.forEach((card: any) => {
        gsap.fromTo(card,
          { y: 20, opacity: 0 },
          {
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=50",
              toggleActions: "play none none reverse"
            },
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
          }
        );
      });
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [loading, activeTab]);`;

  content = content.substring(0, startIdx) + cleanEffect + content.substring(endIdx + 27);
}

fs.writeFileSync('src/App.tsx', content);
