import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Layers, Sparkles, CheckCircle } from 'lucide-react';
import { TechIllustration } from '../components/TechIllustration';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface HeroSectionProps {
  onGetStartedClick: () => void;
  onViewWorkClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStartedClick,
  onViewWorkClick,
}) => {
  const { settings } = useSiteSettings();

  const headline = settings.hero?.headline || 'Building Digital Solutions That Move Businesses Forward.';
  const subheadline = settings.hero?.description || 'Darex provides modern digital solutions designed to help businesses grow, improve their online presence, and operate more efficiently with resilient, custom software architecture.';
  const primaryCta = settings.hero?.primaryButtonText || 'Get Started';
  const secondaryCta = 'View Our Work';

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center pt-28 pb-20 overflow-hidden"
    >
      {/* Subtle Background Radial Gradients */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.12, 0.18, 0.12],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Grid line background overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Tech badge */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400 font-mono font-semibold">DAREX DIGITAL</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">Enterprise Web Engineering & UI/UX</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]"
            >
              {headline}
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-normal"
            >
              {subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGetStartedClick}
                id="hero-primary-cta"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50"
              >
                <span>{primaryCta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewWorkClick}
                id="hero-secondary-cta"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-medium text-slate-200 hover:text-white bg-gradient-to-b from-slate-900/90 to-[#0c0f17] hover:from-slate-800 border border-slate-700/70 hover:border-slate-600 transition-all duration-200 shadow-sm"
              >
                <Layers className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                <span>{secondaryCta}</span>
              </motion.button>

              <PWAInstallButton variant="hero" />
            </motion.div>

            {/* Trust Highlights */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <CheckCircle className="w-3 h-3 text-blue-400" strokeWidth={1.75} />
                </div>
                <span className="text-xs text-slate-300 font-medium">Bespoke Design</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <CheckCircle className="w-3 h-3 text-blue-400" strokeWidth={1.75} />
                </div>
                <span className="text-xs text-slate-300 font-medium">Production Security</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <CheckCircle className="w-3 h-3 text-blue-400" strokeWidth={1.75} />
                </div>
                <span className="text-xs text-slate-300 font-medium">Zero-Downtime Code</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Column - Tech Illustration with Floating Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 w-full mt-6 lg:mt-0"
          >
            <TechIllustration />
          </motion.div>

        </div>
      </div>
    </section>
  );
};
