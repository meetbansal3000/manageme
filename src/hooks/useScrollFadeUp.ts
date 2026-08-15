import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSettings } from '../context/SettingsContext';

gsap.registerPlugin(ScrollTrigger);

export const useScrollFadeUp = (dependencies: any[] = []) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings?.animationsEnabled) {
      gsap.set('.gsap-fade-up', { opacity: 1, y: 0, clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      // Hide initially for those outside viewport to avoid FOUC before ScrollTrigger starts
      gsap.set('.gsap-fade-up', { opacity: 0, y: 30 });

      ScrollTrigger.batch('.gsap-fade-up', {
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.6,
            ease: 'power3.out',
            clearProps: 'transform' // leave opacity 1
          });
        },
        start: 'top 95%', // Trigger just before they come into view
        once: true // Animate only once when scrolling down
      });
    });

    return () => ctx.revert();
  }, [settings?.animationsEnabled, ...dependencies]);
};
