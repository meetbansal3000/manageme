'use client';

import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export const useScrollFadeUp = (dependencies: any[] = []) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const elements = document.querySelectorAll('.gsap-fade-up');
    if (!settings?.animationsEnabled) {
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    );

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(20px)';
      observer.observe(htmlEl);
    });

    return () => {
      observer.disconnect();
    };
  }, [settings?.animationsEnabled, ...dependencies]);
};

export default useScrollFadeUp;
