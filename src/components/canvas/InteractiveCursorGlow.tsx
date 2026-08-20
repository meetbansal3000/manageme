'use client';

import React, { useEffect, useState, useRef } from 'react';

export const InteractiveCursorGlow: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window === 'undefined') return;

    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    setMousePosition({ x: targetX, y: targetY });

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
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
  }, []);

  if (!isMounted) return null;

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
