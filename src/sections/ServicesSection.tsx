import React from 'react';
import { motion } from 'motion/react';
import {
  Code2,
  Palette,
  Layout,
  Briefcase,
  ShoppingBag,
  Wrench,
  Layers,
  ArrowRight,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { SERVICES_DATA } from '../data/services';
import { ClassicIcon } from '../components/ClassicIcon';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const getIconComponent = (iconName: string): LucideIcon => {
    switch (iconName) {
      case 'Code2':
        return Code2;
      case 'Palette':
        return Palette;
      case 'Layout':
        return Layout;
      case 'Briefcase':
        return Briefcase;
      case 'ShoppingBag':
        return ShoppingBag;
      case 'Wrench':
        return Wrench;
      case 'Layers':
      default:
        return Layers;
    }
  };

  return (
    <section id="services" className="py-24 bg-[#090a0f] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
              <span>SPECIALIZED CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Comprehensive Services Engineered for High-Growth Companies.
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg">
              From architectural discovery and bespoke UI/UX design to enterprise-grade web engineering and ongoing maintenance, Darex delivers end-to-end digital excellence.
            </p>
          </div>
        </motion.div>

        {/* Services Grid with Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative bg-[#0d1017] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
            >
              <div>
                {/* Header Tag & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <ClassicIcon
                    icon={getIconComponent(service.iconName)}
                    size="lg"
                    variant="sapphire"
                    strokeWidth={1.35}
                  />
                  <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 shadow-sm">
                    {service.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  {service.description}
                </p>

                {/* Feature Bullet Points */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.5} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Inquire CTA */}
              <div className="mt-7 pt-4">
                <button
                  onClick={() => onSelectService(service.title)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white py-2.5 px-3.5 rounded-xl bg-slate-900/80 border border-slate-800 group-hover:border-blue-500/40 group-hover:bg-blue-600 transition-all shadow-sm"
                >
                  <span>Inquire for {service.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
