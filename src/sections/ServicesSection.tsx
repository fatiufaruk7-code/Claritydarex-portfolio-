import React from 'react';
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
} from 'lucide-react';
import { SERVICES_DATA } from '../data/services';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-6 h-6" />;
      case 'Palette':
        return <Palette className="w-6 h-6" />;
      case 'Layout':
        return <Layout className="w-6 h-6" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6" />;
      case 'Layers':
      default:
        return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-[#090a0f] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
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
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              className="group relative bg-[#0d1017] border border-slate-800/90 hover:border-blue-500/50 rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/30 hover:-translate-y-1"
            >
              <div>
                {/* Header Tag & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-800/40 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {getIcon(service.iconName)}
                  </div>
                  <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
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
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Inquire CTA */}
              <div className="mt-7 pt-4">
                <button
                  onClick={() => onSelectService(service.title)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white py-2 px-3 rounded-lg bg-slate-900/60 group-hover:bg-blue-600 transition-colors"
                >
                  <span>Inquire for {service.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
