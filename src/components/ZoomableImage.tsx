import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { triggerHaptic, IOS_SPRING } from '../utils/haptics';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt = 'Preview',
  className = '',
}) => {
  const [scale, setScale] = useState(1);
  const [lastTap, setLastTap] = useState(0);

  const handleTouchTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double-tap detected
      triggerHaptic(15);
      setScale(prev => (prev === 1 ? 2 : 1));
    }
    setLastTap(now);
  };

  const toggleZoom = () => {
    triggerHaptic(10);
    setScale(prev => (prev === 1 ? 2 : 1));
  };

  return (
    <div 
      className={`relative overflow-hidden select-none touch-none ${className}`} 
      onClick={handleTouchTap}
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <motion.img
          src={src}
          alt={alt}
          animate={{ scale }}
          transition={IOS_SPRING}
          drag={scale > 1}
          dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
          dragElastic={0.15}
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* Floating Zoom Indicator Pill */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[11px] text-white shadow-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          className="flex items-center gap-1 hover:text-amber-300 transition-colors font-mono font-medium cursor-pointer"
          title="Toggle Zoom (Double tap)"
        >
          {scale === 1 ? <ZoomIn className="w-3.5 h-3.5 text-amber-400" /> : <ZoomOut className="w-3.5 h-3.5 text-amber-400" />}
          <span>{Math.round(scale * 100)}% (Double Tap)</span>
        </button>
      </div>
    </div>
  );
};
