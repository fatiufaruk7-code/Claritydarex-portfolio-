import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type ClassicIconVariant = 'platinum' | 'sapphire' | 'bronze' | 'emerald' | 'amber';
export type ClassicIconSize = 'sm' | 'md' | 'lg' | 'xl';

interface ClassicIconProps {
  icon: LucideIcon;
  variant?: ClassicIconVariant;
  size?: ClassicIconSize;
  className?: string;
  strokeWidth?: number;
}

export const ClassicIcon: React.FC<ClassicIconProps> = ({
  icon: Icon,
  variant = 'sapphire',
  size = 'md',
  className = '',
  strokeWidth = 1.4,
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-9 h-9 rounded-xl',
      icon: 'w-4 h-4',
    },
    md: {
      container: 'w-11 h-11 rounded-xl',
      icon: 'w-5 h-5',
    },
    lg: {
      container: 'w-13 h-13 rounded-2xl',
      icon: 'w-6 h-6',
    },
    xl: {
      container: 'w-16 h-16 rounded-2xl',
      icon: 'w-7 h-7',
    },
  }[size];

  const variantStyles = {
    platinum: {
      border: 'border-slate-700/80 group-hover:border-slate-500/90',
      bg: 'bg-gradient-to-b from-slate-800/90 via-[#121620] to-[#090c12]',
      shadow: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_6px_16px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_24px_rgba(0,0,0,0.7)]',
      iconColor: 'text-slate-200 group-hover:text-white',
      accentGlow: 'from-white/[0.08] to-transparent',
    },
    sapphire: {
      border: 'border-slate-700/70 group-hover:border-blue-400/60',
      bg: 'bg-gradient-to-b from-[#161d2d] via-[#0f1422] to-[#090c14]',
      shadow: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_6px_18px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_8px_24px_rgba(59,130,246,0.2)]',
      iconColor: 'text-blue-300 group-hover:text-blue-200',
      accentGlow: 'from-blue-500/[0.12] to-transparent',
    },
    bronze: {
      border: 'border-amber-700/60 group-hover:border-amber-500/70',
      bg: 'bg-gradient-to-b from-[#241a12] via-[#16110c] to-[#0a0705]',
      shadow: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_6px_18px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_8px_24px_rgba(217,119,6,0.2)]',
      iconColor: 'text-amber-200 group-hover:text-amber-100',
      accentGlow: 'from-amber-500/[0.12] to-transparent',
    },
    emerald: {
      border: 'border-emerald-700/60 group-hover:border-emerald-500/70',
      bg: 'bg-gradient-to-b from-[#102219] via-[#0b1611] to-[#060c09]',
      shadow: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_6px_18px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_8px_24px_rgba(16,185,129,0.2)]',
      iconColor: 'text-emerald-300 group-hover:text-emerald-200',
      accentGlow: 'from-emerald-500/[0.12] to-transparent',
    },
    amber: {
      border: 'border-amber-600/60 group-hover:border-amber-400/70',
      bg: 'bg-gradient-to-b from-[#221c10] via-[#16120b] to-[#0a0805]',
      shadow: 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_6px_18px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_8px_24px_rgba(245,158,11,0.2)]',
      iconColor: 'text-amber-300 group-hover:text-amber-200',
      accentGlow: 'from-amber-400/[0.12] to-transparent',
    },
  }[variant];

  return (
    <div
      className={`relative ${sizeClasses.container} ${variantStyles.bg} ${variantStyles.border} ${variantStyles.shadow} border p-[1px] flex items-center justify-center transition-all duration-300 shrink-0 group-hover:scale-[1.03] ${className}`}
    >
      {/* Delicate inner hairline ring for luxury watch bezel effect */}
      <div className="absolute inset-[2px] rounded-[inherit] border border-white/[0.04] pointer-events-none" />

      {/* Subtle top ambient sheen */}
      <div
        className={`absolute inset-0 rounded-[inherit] bg-gradient-to-b ${variantStyles.accentGlow} pointer-events-none`}
      />

      {/* The Icon itself with refined thin stroke weight */}
      <Icon
        className={`relative z-10 ${sizeClasses.icon} ${variantStyles.iconColor} transition-colors duration-200`}
        strokeWidth={strokeWidth}
      />
    </div>
  );
};
