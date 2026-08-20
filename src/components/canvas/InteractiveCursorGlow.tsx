import React, { useEffect, useState } from 'react';

export const InteractiveCursorGlow: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 3 : 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const updatePosition = () => {
      // Smooth lerp interpolation for silky weighted tracking
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      
      setMousePosition({
        x: Math.round(currentX * 10) / 10,
        y: Math.round(currentY * 10) / 10
      });

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 overflow-hidden ${
        isVisible ? 'opacity-100' : 'opacity-40'
      }`}
      style={{
        background: `radial-gradient(650px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 82, 255, 0.14), rgba(198, 69, 249, 0.07), transparent 70%)`
      }}
      aria-hidden="true"
    />
  );
};

export default InteractiveCursorGlow;
