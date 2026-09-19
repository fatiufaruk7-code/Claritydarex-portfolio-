import React from 'react';
import { ShieldCheck, Activity, Terminal, Zap, CheckCircle2, Globe, Cpu } from 'lucide-react';

export const TechIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto select-none" id="tech-illustration-hero">
      {/* Ambient background glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none opacity-60" />

      {/* Main Glass Terminal Frame */}
      <div className="relative z-10 bg-[#0d111a]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-blue-950/40">
        
        {/* Window controls bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-xs font-mono text-slate-400 font-medium">darex-core-engine.ts</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-[11px] font-mono text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE RUNTIME
          </div>
        </div>

        {/* Code / Architecture preview block */}
        <div className="bg-[#07090e] rounded-xl p-4 font-mono text-xs border border-slate-800/60 overflow-hidden text-slate-300">
          <div className="flex items-center gap-2 text-slate-500 mb-3 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pipeline verified: 100% test coverage passed</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid Overlay */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Performance Score</div>
              <div className="text-lg font-semibold text-white tracking-tight">99.8%</div>
              <div className="text-[10px] text-emerald-400">Optimal LCP & FCP</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Infrastructure Uptime</div>
              <div className="text-lg font-semibold text-white tracking-tight">99.98%</div>
              <div className="text-[10px] text-indigo-300">Tier-4 Cloud Redundancy</div>
            </div>
          </div>
        </div>

        {/* Live Traffic / Nodes ticker */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">Multi-Region Edge Network</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>24ms latency</span>
          </div>
        </div>
      </div>

      {/* Floating accent card: Client Satisfaction */}
      <div className="absolute -bottom-6 -left-4 sm:-left-6 z-20 bg-gradient-to-b from-slate-900 to-[#0c1017] border border-blue-500/30 rounded-xl p-3.5 shadow-xl shadow-black/60 hidden sm:flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
          <Activity className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">Client Success Index</div>
          <div className="text-[11px] text-slate-400">100% Project Milestone Delivery</div>
        </div>
      </div>
    </div>
  );
};
