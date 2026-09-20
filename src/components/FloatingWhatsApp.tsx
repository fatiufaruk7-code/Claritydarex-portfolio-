import React, { useState } from 'react';
import { MessageSquare, X, ArrowUpRight } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl = `https://wa.me/2348137941486?text=${encodeURIComponent(
    'Hello Faruk, I am visiting Darex and would like to discuss a project with you.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end print:hidden">
      {/* Expanded Quick Message Bubble */}
      {isOpen && (
        <div className="mb-3 w-80 bg-gradient-to-b from-[#141a26] via-[#0e121a] to-[#080b10] border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-emerald-600/30 to-emerald-950/80 border border-emerald-500/50 flex items-center justify-center font-mono font-bold text-xs text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  FF
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0e121a] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight">Faruk Fatiu</div>
                <div className="text-[10px] text-slate-400 font-medium">Lead Engineer • Darex</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              aria-label="Close message"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-300 leading-relaxed">
            Need an immediate response or want to discuss technical scope and pricing directly with our lead developer?
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30"
          >
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Direct Developer WhatsApp</span>
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Direct WhatsApp Consultation"
        className="group relative flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-full bg-gradient-to-b from-slate-800/90 via-[#10141e] to-[#090c12] border border-slate-700/80 hover:border-emerald-500/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.6)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_28px_rgba(16,185,129,0.25)] text-white transition-all duration-300 hover:scale-[1.03]"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </span>

        <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-inner">
          <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
        </div>

        <span className="text-xs font-semibold tracking-wide text-slate-200 group-hover:text-white">
          Chat on WhatsApp
        </span>
      </button>
    </div>
  );
};
