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
        <div className="mb-3 w-80 bg-[#0e121a] border border-slate-800 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                  FF
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0e121a]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Faruk Fatiu</div>
                <div className="text-[10px] text-slate-400">Lead Engineer • Darex</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-300 leading-relaxed">
            Need a quick answer or want to talk about a website project right away?
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/30"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp Chat</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Direct WhatsApp Consultation"
        className="group relative flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-full bg-[#0e121a] border border-slate-700/80 hover:border-emerald-500/60 shadow-xl hover:shadow-emerald-950/40 text-white transition-all duration-300 hover:scale-105"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>

        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 fill-emerald-400/20" />
        </div>

        <span className="text-xs font-semibold tracking-wide text-slate-200 group-hover:text-white">
          Chat on WhatsApp
        </span>
      </button>
    </div>
  );
};
