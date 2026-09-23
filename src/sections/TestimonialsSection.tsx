import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  Key,
  CheckCircle,
  ShieldCheck,
  Shield,
  Sparkles,
  Star,
  Quote,
  type LucideIcon,
} from 'lucide-react';
import {
  subscribeToTestimonials,
  subscribeToCommitments,
} from '../services/testimonialsService';
import { COMMITMENTS_DATA } from '../data/testimonials';
import { ClassicIcon, type ClassicIconVariant } from '../components/ClassicIcon';
import type { CommitmentItem, TestimonialItem } from '../types';

export const TestimonialsSection: React.FC = () => {
  const [commitments, setCommitments] = useState<CommitmentItem[]>(COMMITMENTS_DATA);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  // Synchronize commitments and testimonials from Firestore
  useEffect(() => {
    const unsubCommitments = subscribeToCommitments((items) => {
      if (items && items.length > 0) {
        setCommitments(items);
      }
    });

    const unsubTestimonials = subscribeToTestimonials((items) => {
      const published = items.filter((t) => t.published !== false);
      setTestimonials(published);
    });

    return () => {
      unsubCommitments();
      unsubTestimonials();
    };
  }, []);

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
          {commitments.map((item, index) => {
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

        {/* Published Client Testimonials (if available) */}
        {testimonials.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-800/80 space-y-8">
            <div className="max-w-2xl">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold">
                VERIFIED PARTNER FEEDBACK
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                Client Testimonials & Performance Endorsements
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#0e121a] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-blue-500/30" />
                    </div>

                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
                        {t.avatarText}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t.clientName}</h4>
                        <p className="text-xs text-slate-400">
                          {t.clientRole} {t.company && `&bull; ${t.company}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

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
              <h3 className="text-sm font-semibold text-white">
                Darex Quality & Milestone Transparency Commitment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every project is subject to milestone code reviews, automated CI verification, and guaranteed handover warranties.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all whitespace-nowrap cursor-pointer"
          >
            Start Your Project
          </a>
        </motion.div>
      </div>
    </section>
  );
};
