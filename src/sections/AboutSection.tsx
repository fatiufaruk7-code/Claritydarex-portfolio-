import React from 'react';
import { motion } from 'motion/react';
import { Target, Award, Users2, Sparkles, CheckCircle2 } from 'lucide-react';
import { COMPANY_STATS } from '../data/company';
import { ClassicIcon } from '../components/ClassicIcon';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#090b10] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <span>ABOUT DAREX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered to Solve Real Business Challenges Through Digital Precision.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Darex is a dedicated web design and development practice based in Lagos, Nigeria. Founded and led by Faruk Fatiu, we build custom digital solutions that bridge business goals with clean, reliable, and high-performance software architecture.
          </p>
        </motion.div>

        {/* 3 Pillars of Approach */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group bg-[#0e121a] border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-black/50"
          >
            <ClassicIcon icon={Target} size="lg" variant="sapphire" strokeWidth={1.35} className="mb-5" />
            <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">Problem-First Engineering</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We do not impose cookie-cutter templates. Every layout, user interaction, and data workflow is specifically structured to eliminate bottlenecks and convert visitors into clients.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group bg-[#0e121a] border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-black/50"
          >
            <ClassicIcon icon={Award} size="lg" variant="platinum" strokeWidth={1.35} className="mb-5" />
            <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-slate-200 transition-colors">Uncompromising Quality</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              From sub-second page delivery to strict accessibility standards and bulletproof type safety, we treat digital craftsmanship as an exacting standard, never an afterthought.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group bg-[#0e121a] border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-black/50"
          >
            <ClassicIcon icon={Users2} size="lg" variant="emerald" strokeWidth={1.35} className="mb-5" />
            <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-emerald-300 transition-colors">Direct Client Partnership</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              You communicate and build directly with your lead developer. Transparent milestones, rapid feedback cycles, and thorough testing ensure your project is delivered right.
            </p>
          </motion.div>
        </div>

        {/* Engineering Standards & Benchmarks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#0d111a] via-[#101522] to-[#0d111a] border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl"
        >
          <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Our Technical Benchmarks & Standards
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              100% Truth in Engineering
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
            {COMPANY_STATS.map((stat, index) => (
              <div
                key={index}
                className={`flex flex-col ${index > 0 ? 'pt-6 lg:pt-0 lg:pl-8' : ''}`}
              >
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-mono tracking-tight text-blue-400">
                  {stat.value}
                </span>
                <span className="mt-2 text-base font-semibold text-slate-200">
                  {stat.label}
                </span>
                <span className="mt-1 text-xs text-slate-400 leading-normal">
                  {stat.sublabel}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
