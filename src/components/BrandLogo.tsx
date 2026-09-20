import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showWordmark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showWordmark = true,
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', icon: 'text-xs', text: 'text-lg', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', icon: 'text-sm', text: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', icon: 'text-base', text: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Luxury Horological Emblem */}
      <div
        className={`relative ${dimensions.box} rounded-xl bg-gradient-to-b from-slate-700/80 via-[#10141e] to-[#080a0f] p-[1px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.6)] border border-slate-700/50 group transition-all duration-300 hover:border-blue-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_6px_20px_rgba(59,130,246,0.25)]`}
      >
        {/* Inner chamfered facet */}
        <div className="w-full h-full rounded-[11px] bg-gradient-to-b from-[#141926] to-[#07090e] flex items-center justify-center relative overflow-hidden">
          {/* Subtle diagonal specular refraction */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />

          {/* Geometric Diamond Core Mark */}
          <div className="relative z-10 flex items-center justify-center font-mono font-black tracking-tighter">
            <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">D</span>
            <span className="text-blue-400 font-extrabold -ml-0.5 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">X</span>
          </div>

          {/* Precision corner ticks */}
          <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-slate-600/60" />
          <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-blue-500/60" />
        </div>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-white font-sans ${dimensions.text}`}>
              DAREX
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
          <span className={`font-mono uppercase tracking-[0.2em] text-slate-400 -mt-1 font-medium ${dimensions.sub}`}>
            DIGITAL SYSTEMS
          </span>
        </div>
      )}
    </div>
  );
};
