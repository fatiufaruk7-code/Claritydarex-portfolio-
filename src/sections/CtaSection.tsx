import React from 'react';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

interface CtaSectionProps {
  onStartProjectClick: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onStartProjectClick }) => {
  return (
    <section className="py-20 bg-[#07090e] border-t border-slate-800/80 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="bg-gradient-to-b from-[#0d121c] to-[#0a0c12] border border-slate-800 rounded-3xl p-10 sm:p-16 shadow-2xl shadow-blue-950/20">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LET’S COLLABORATE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Have a project in mind?
          </h2>
          
          <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Let's turn your idea into a digital experience. Our team is ready to analyze your requirements and architect a high-impact solution.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartProjectClick}
              id="cta-start-project-btn"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span>Direct Email</span>
            </a>
          </div>

          <div className="mt-8 text-xs text-slate-400 font-mono">
            Average response time: &lt; 24 business hours
          </div>
        </div>
      </div>
    </section>
  );
};
