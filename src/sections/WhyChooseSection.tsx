import React from 'react';
import {
  Cpu,
  Palette,
  Smartphone,
  ShieldCheck,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { WHY_CHOOSE_DAREX } from '../data/company';

export const WhyChooseSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'TrendingUp':
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <section id="why-darex" className="py-24 bg-[#090b10] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <span>THE DAREX ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Forward-Looking Businesses Choose to Build With Darex.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            We partner with businesses seeking durable engineering and distinctive digital presence, grounded in clear communication and transparent execution.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_DAREX.map((item, index) => (
            <div
              key={index}
              className="bg-[#0e121a] border border-slate-800/90 rounded-2xl p-6 sm:p-7 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                  {getIcon(item.iconName)}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Quality Standard</span>
              </div>
            </div>
          ))}

          {/* Value Summary Card */}
          <div className="bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-[#0e121a] border border-blue-800/40 rounded-2xl p-6 sm:p-7 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-white mb-2">Our Operating Promise</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              No bloated retainers. No generic boilerplate. Direct collaboration with senior engineers and designers focused solely on elevating your business.
            </p>
            <div className="mt-4 text-xs font-mono text-blue-400 font-medium">
              // ARCHITECTED FOR RESILIENCE
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
