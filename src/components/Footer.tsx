import React from 'react';
import { ArrowUp, Github, Twitter, Instagram, MessageCircle, Globe, ExternalLink, Shield } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface FooterProps {
  onNavigateToView: (view: 'home' | 'admin') => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToView, onScrollToSection }) => {
  const { settings } = useSiteSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = {
    github: settings.socialMedia?.github || COMPANY_INFO.socialLinks.github,
    twitter: settings.socialMedia?.twitter || COMPANY_INFO.socialLinks.twitter,
    instagram: settings.socialMedia?.instagram || COMPANY_INFO.socialLinks.instagram,
    whatsapp: settings.socialMedia?.whatsapp || COMPANY_INFO.socialLinks.whatsapp,
  };

  return (
    <footer className="bg-[#06080c] border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {settings.footer?.description ||
                'Building digital solutions that move businesses forward. Full-cycle engineering, modern design, and enterprise-grade web development.'}
            </p>
            <div className="pt-2 flex items-center gap-3">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-blue-300 hover:border-blue-400/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(59,130,246,0.2)] transition-all duration-300 hover:scale-105"
                >
                  <Github className="w-4 h-4" strokeWidth={1.4} />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-blue-300 hover:border-blue-400/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(59,130,246,0.2)] transition-all duration-300 hover:scale-105"
                >
                  <Twitter className="w-4 h-4" strokeWidth={1.4} />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(236,72,153,0.2)] transition-all duration-300 hover:scale-105"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1.4} />
                </a>
              )}
              {socialLinks.whatsapp && (
                <a
                  href={
                    socialLinks.whatsapp.startsWith('http')
                      ? socialLinks.whatsapp
                      : `https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(16,185,129,0.2)] transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.4} />
                </a>
              )}
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
              <li className="text-slate-300 font-medium">{settings.general?.location || COMPANY_INFO.location}</li>
              <li>
                <a href={`mailto:${settings.contact?.email || COMPANY_INFO.email}`} className="hover:text-white transition-colors">
                  {settings.contact?.email || COMPANY_INFO.email}
                </a>
              </li>
              <li>
                <a href={`tel:${settings.contact?.phone || COMPANY_INFO.phone}`} className="font-mono hover:text-white transition-colors">
                  {settings.contact?.phone || COMPANY_INFO.phoneFormatted}
                </a>
              </li>
              <li className="pt-0.5">
                <a
                  href={COMPANY_INFO.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Darex Website</span>
                  <ExternalLink className="w-3 h-3 opacity-70" strokeWidth={1.5} />
                </a>
              </li>
              <li className="pt-3 flex flex-col gap-2">
                {/* Discrete Admin Link */}
                <button
                  onClick={() => onNavigateToView('admin')}
                  id="footer-admin-link"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>

                <div>
                  <PWAInstallButton variant="footer" />
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} {settings.footer?.copyrightText || 'Darex Digital Systems. All rights reserved.'}
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
