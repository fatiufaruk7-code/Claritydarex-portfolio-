import React from 'react';
import { ShieldCheck, Activity, Terminal, Zap, CheckCircle2, Globe, Cpu } from 'lucide-react';
import { ClassicIcon } from './ClassicIcon';

export const TechIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto select-none" id="tech-illustration-hero">
      {/* Ambient background glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none opacity-60" />

      {/* Main Glass Terminal Frame */}
      <div className="relative z-10 bg-[#0d111a]/92 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80">
        
        {/* Window controls bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-inner" />
            <span className="ml-2 text-xs font-mono text-slate-400 font-medium">darex-core-engine.ts</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-[11px] font-mono text-blue-400 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            LIVE RUNTIME
          </div>
        </div>

        {/* Code / Architecture preview block */}
        <div className="bg-[#07090e] rounded-xl p-4 font-mono text-xs border border-slate-800/80 overflow-hidden text-slate-300 shadow-inner">
          <div className="flex items-center gap-2 text-slate-400 mb-3 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
            <span>darex.systems // architecture-orchestrator</span>
          </div>
          <div className="space-y-1.5 leading-relaxed">
            <p>
              <span className="text-purple-400">const</span>{' '}
              <span className="text-blue-400">digitalArchitecture</span> ={' '}
              <span className="text-amber-300">await</span> Darex.<span className="text-emerald-400">engineer</span>({`{`}
            </p>
            <p className="pl-4">
              performance: <span className="text-emerald-300">"sub-second"</span>,
            </p>
            <p className="pl-4">
              scalability: <span className="text-indigo-300">"enterprise-scale"</span>,
            </p>
            <p className="pl-4">
              resilience: <span className="text-blue-300">"zero-downtime"</span>,
            </p>
            <p className="pl-4">
              designSystem: <span className="text-rose-300">"bespoke-brand"</span>
            </p>
            <p>{`});`}</p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Pipeline verified: 100% test coverage passed</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid Overlay */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3 shadow-md">
            <ClassicIcon icon={Zap} size="sm" variant="sapphire" strokeWidth={1.4} />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Performance Score</div>
              <div className="text-lg font-semibold text-white tracking-tight">99.8%</div>
              <div className="text-[10px] text-emerald-400">Optimal LCP & FCP</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3 shadow-md">
            <ClassicIcon icon={ShieldCheck} size="sm" variant="platinum" strokeWidth={1.4} />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Architecture Standard</div>
              <div className="text-lg font-semibold text-white tracking-tight">100%</div>
              <div className="text-[10px] text-indigo-300">Clean Type-Safe Code</div>
            </div>
          </div>
        </div>

        {/* Live Traffic / Nodes ticker */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
            <span className="text-slate-300">Responsive Cross-Device Architecture</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
            <span>Modern Toolchain</span>
          </div>
        </div>
      </div>

      {/* Floating accent card */}
      <div className="absolute -bottom-6 -left-4 sm:-left-6 z-20 bg-gradient-to-b from-[#141926] via-[#0e121a] to-[#070a10] border border-slate-700/80 rounded-xl p-3.5 shadow-2xl shadow-black/80 hidden sm:flex items-center gap-3">
        <ClassicIcon icon={Activity} size="sm" variant="sapphire" strokeWidth={1.4} />
        <div>
          <div className="text-xs font-semibold text-white">Engineering Quality</div>
          <div className="text-[11px] text-slate-400">Custom TypeScript & Tailwind CSS</div>
        </div>
      </div>
    </div>
  );
};
