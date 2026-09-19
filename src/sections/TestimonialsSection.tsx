import React from 'react';
import { Star, Quote, Building2, CheckCircle } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonials';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-[#090a0f] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <span>CLIENT ENDORSEMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Leaders Who Value Reliability and Impact.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Read how Darex partners with executives and enterprise founders to deliver transformative digital experiences.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="bg-[#0e121a] border border-slate-800/90 rounded-2xl p-7 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              <div>
                {/* Star rating & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-700" />
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-5 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-mono font-bold text-sm text-blue-400 shrink-0">
                    {t.avatarText}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white leading-tight">
                      {t.clientName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {t.clientRole}, <span className="text-slate-200">{t.company}</span>
                    </div>
                  </div>
                </div>

                {/* Project Delivered badge */}
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{t.projectDelivered}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
