import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is the typical delivery timeline for a custom website or web app?',
    answer:
      'Timelines vary based on scope complexity. A high-performance corporate website or portfolio is typically delivered within 2 to 3 weeks. Comprehensive e-commerce systems, custom portals, or database-driven web applications typically range between 4 to 8 weeks, structured around sprint milestones with regular weekly reviews.',
  },
  {
    question: 'What core technologies and frameworks does Darex build with?',
    answer:
      'We specialize in modern, scalable technology stacks: React, TypeScript, Next.js, Vite, Tailwind CSS, Node.js, Express, PostgreSQL, REST APIs, and cloud deployments on Cloud Run, Vercel, and AWS. Every codebase is optimized for sub-second page loads, SEO indexing, and robust security.',
  },
  {
    question: 'Can Darex redesign or modernize our existing website?',
    answer:
      'Yes. Many of our clients have an existing website that is outdated, sluggish, or poor at generating leads. We audit your existing architecture, design a contemporary brand interface, modernize the underlying code, and ensure all existing SEO equity and URL redirects are preserved.',
  },
  {
    question: 'How are project payments and milestone billing structured?',
    answer:
      'We operate on transparent milestone-based agreements: typically a 40% initial deposit upon architectural kickoff, 30% upon approval of intermediate design prototypes and core engineering, and 30% upon final staging approval and domain DNS rollout. Custom enterprise contracts can also be accommodated.',
  },
  {
    question: 'Do you provide post-launch maintenance, security patches, and updates?',
    answer:
      'Absolutely. We offer ongoing maintenance retainers covering security audits, content updates, dependency upgrades, uptime monitoring, and priority technical support to ensure your digital platform remains resilient.',
  },
  {
    question: 'How do we kick off a project with Darex?',
    answer:
      'Simply fill out the project inquiry form below or reach out directly to our lead engineer on WhatsApp (+234 813 794 1486) or email (fatiufaruk7@gmail.com). We will review your requirements and schedule an initial technical discovery session.',
  },
];

export const FaqSection: React.FC<{ onContactClick: () => void }> = ({ onContactClick }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#07090e] border-t border-slate-800/80 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>COMMONLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-slate-300 text-base">
            Everything you need to know about our engineering standards, delivery process, and working with Darex.
          </p>
        </motion.div>

        {/* Accordion list */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="bg-[#0e121a] border border-slate-800/90 rounded-2xl overflow-hidden transition-all hover:border-slate-700 shadow-md"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none group"
                >
                  <span className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/70 flex items-center justify-center text-slate-400 shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-200 ${
                      isOpen ? 'rotate-180 text-blue-400 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'group-hover:border-slate-600 group-hover:text-slate-200'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom prompt */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            Have a custom requirement or specialized technical inquiry?
          </p>
          <button
            onClick={onContactClick}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Ask us directly in the inquiry form</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

      </div>
    </section>
  );
};
