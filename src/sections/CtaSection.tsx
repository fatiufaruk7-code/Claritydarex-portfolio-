import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Mail } from 'lucide-react';
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-[#0d121c] to-[#0a0c12] border border-slate-800/90 rounded-3xl p-10 sm:p-16 shadow-2xl shadow-black/80"
        >
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>LET’S COLLABORATE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Have a project in mind?
          </h2>
          
          <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Let's turn your idea into a high-performance digital asset. Our lead engineer is ready to analyze your requirements and architect a high-impact solution.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartProjectClick}
              id="cta-start-project-btn"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_24px_rgba(37,99,235,0.4)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_10px_30px_rgba(37,99,235,0.55)]"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </button>

            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-medium text-slate-200 hover:text-white bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 hover:border-slate-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all active:scale-[0.98]"
            >
              <Mail className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
              <span>Direct Executive Email</span>
            </a>
          </div>

          <div className="mt-8 text-xs text-slate-400 font-mono">
            Average response time: &lt; 24 business hours
          </div>
        </motion.div>
      </div>
    </section>
  );
};
