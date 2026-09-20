import React from 'react';
import { motion } from 'motion/react';
import { UserCheck, Key, CheckCircle, ShieldCheck, Shield, Sparkles, type LucideIcon } from 'lucide-react';
import { COMMITMENTS_DATA } from '../data/testimonials';
import { ClassicIcon, type ClassicIconVariant } from '../components/ClassicIcon';

export const TestimonialsSection: React.FC = () => {
  const getIconData = (iconName: string): { icon: LucideIcon; variant: ClassicIconVariant } => {
    switch (iconName) {
      case 'UserCheck':
        return { icon: UserCheck, variant: 'sapphire' };
      case 'Key':
        return { icon: Key, variant: 'amber' };
      case 'CheckCircle':
        return { icon: CheckCircle, variant: 'emerald' };
      case 'ShieldCheck':
      default:
        return { icon: ShieldCheck, variant: 'platinum' };
    }
  };

  return (
    <section id="commitments" className="py-24 bg-[#090a0f] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>CLIENT COMMITMENT & GUARANTEES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our Work Ethic & Ironclad Project Guarantees.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            We hold ourselves to transparent standards: direct communication with your engineer, milestone verification, and complete intellectual property ownership.
          </p>
        </motion.div>

        {/* Commitments Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMITMENTS_DATA.map((item, index) => {
            const { icon, variant } = getIconData(item.iconName);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-[#0e121a] border border-slate-800/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-black/60"
              >
                <div>
                  <ClassicIcon
                    icon={icon}
                    size="md"
                    variant={variant}
                    strokeWidth={1.35}
                    className="mb-5"
                  />

                  <div className="text-xs font-mono text-blue-400 mb-1">
                    {item.subtitle}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    <span>{item.guarantee}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Transparent Review Policy Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mt-12 p-5 rounded-2xl bg-gradient-to-r from-[#0d121c] via-[#0e1524] to-[#0d121c] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-3.5">
            <ClassicIcon icon={Sparkles} size="sm" variant="sapphire" strokeWidth={1.4} />
            <div>
              <div className="text-sm font-semibold text-white">
                Authentic Reviews Policy
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
                We believe in complete professional honesty. We never publish synthetic reviews or fabricated client personas. Real client reviews will be published only with verified client authorization.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-blue-400 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/30 shrink-0">
            100% VERIFIED & HONEST
          </div>
        </motion.div>

      </div>
    </section>
  );
};
