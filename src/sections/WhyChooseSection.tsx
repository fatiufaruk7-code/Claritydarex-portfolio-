import React from 'react';
import { motion } from 'motion/react';
import {
  Cpu,
  Palette,
  Smartphone,
  ShieldCheck,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { WHY_CHOOSE_DAREX } from '../data/company';
import { ClassicIcon, type ClassicIconVariant } from '../components/ClassicIcon';

export const WhyChooseSection: React.FC = () => {
  const getIconData = (iconName: string): { icon: LucideIcon; variant: ClassicIconVariant } => {
    switch (iconName) {
      case 'Cpu':
        return { icon: Cpu, variant: 'sapphire' };
      case 'Palette':
        return { icon: Palette, variant: 'platinum' };
      case 'Smartphone':
        return { icon: Smartphone, variant: 'sapphire' };
      case 'ShieldCheck':
        return { icon: ShieldCheck, variant: 'emerald' };
      case 'MessageSquare':
        return { icon: MessageSquare, variant: 'amber' };
      case 'Users':
        return { icon: Users, variant: 'platinum' };
      case 'TrendingUp':
      default:
        return { icon: TrendingUp, variant: 'sapphire' };
    }
  };

  return (
    <section id="why-darex" className="py-24 bg-[#090b10] border-t border-slate-800/80 relative">
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
            <span>THE DAREX ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Forward-Looking Businesses Choose to Build With Darex.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            We partner with businesses seeking durable engineering and distinctive digital presence, grounded in clear communication and transparent execution.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_DAREX.map((item, index) => {
            const { icon, variant } = getIconData(item.iconName);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group bg-[#0e121a] border border-slate-800/90 rounded-2xl p-6 sm:p-7 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-black/50"
              >
                <div>
                  <ClassicIcon
                    icon={icon}
                    size="md"
                    variant={variant}
                    strokeWidth={1.35}
                    className="mb-5"
                  />
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                  <span>Enterprise Quality Standard</span>
                </div>
              </motion.div>
            );
          })}

          {/* Value Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: WHY_CHOOSE_DAREX.length * 0.07 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-[#0e121a] border border-blue-800/40 rounded-2xl p-6 sm:p-7 flex flex-col justify-center shadow-xl"
          >
            <h3 className="text-lg font-bold text-white mb-2">Our Operating Promise</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              No bloated retainers. No generic boilerplate. Direct collaboration with senior engineers and designers focused solely on elevating your business.
            </p>
            <div className="mt-4 text-xs font-mono text-blue-400 font-medium tracking-wider">
              // ARCHITECTED FOR RESILIENCE
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
