import React from 'react';

export const AIAvatar: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-r from-[#0071e3] via-purple-500 to-pink-500 shadow-sm ${className}`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0071e3] via-purple-500 to-pink-500 animate-pulse opacity-75 blur-sm"></div>
    <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
      <div className="w-[30%] h-[30%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
    </div>
  </div>
);
