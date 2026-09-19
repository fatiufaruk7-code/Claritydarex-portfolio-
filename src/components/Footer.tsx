import React from 'react';
import { ArrowUp, Github, Linkedin, Twitter, Dribbble, Shield, Heart } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

interface FooterProps {
  onNavigateToView: (view: 'home' | 'admin') => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToView, onScrollToSection }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#06080c] border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] shadow-md shadow-blue-500/20">
                <div className="w-full h-full bg-[#090a0f] rounded-[11px] flex items-center justify-center font-bold text-base text-white font-mono">
                  <span className="text-blue-500">D</span>X
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">DAREX</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Building digital solutions that move businesses forward. Full-cycle engineering, modern design, and enterprise-grade web development.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={COMPANY_INFO.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={COMPANY_INFO.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={COMPANY_INFO.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={COMPANY_INFO.socialLinks.dribbble}
                target="_blank"
                rel="noreferrer"
                aria-label="Dribbble"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-colors"
              >
                <Dribbble className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-4">
              Navigation
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onScrollToSection('home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('about')}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-white transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('projects')}
                  className="hover:text-white transition-colors"
                >
                  Case Studies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('why-darex')}
                  className="hover:text-white transition-colors"
                >
                  Why Darex
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services list */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-4">
              Expertise
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-white transition-colors"
                >
                  Website Development
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-white transition-colors"
                >
                  UI/UX & Design Systems
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-white transition-colors"
                >
                  E-commerce Platforms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-white transition-colors"
                >
                  Corporate Portals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-white transition-colors"
                >
                  Maintenance & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details & Admin portal access */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-4">
              Office
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-300 font-medium">{COMPANY_INFO.location}</li>
              <li>
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-white transition-colors">
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li>
                <a href={`tel:${COMPANY_INFO.phone}`} className="font-mono hover:text-white transition-colors">
                  {COMPANY_INFO.phoneFormatted} ({COMPANY_INFO.phone})
                </a>
              </li>
              <li className="pt-3">
                {/* Discrete Admin Link */}
                <button
                  onClick={() => onNavigateToView('admin')}
                  id="footer-admin-link"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Darex Digital Systems. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span>Enterprise Quality & Security</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
