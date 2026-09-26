import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Globe, ExternalLink } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { COMPANY_INFO } from '../data/company';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#090a0f]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="focus:outline-none"
            id="navbar-brand-link"
          >
            <BrandLogo size="md" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            <button
              onClick={() => handleNavClick('home')}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => handleNavClick('projects')}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Projects
            </button>
            <button
              onClick={() => handleNavClick('why-darex')}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Why Darex
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <PWAInstallButton variant="header" />

            <a
              href={COMPANY_INFO.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              title="Visit Darex Official Website"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
              <span>Darex Website</span>
              <ExternalLink className="w-3 h-3 opacity-60" strokeWidth={1.5} />
            </a>

            <button
              onClick={() => handleNavClick('contact')}
              id="navbar-get-started-btn"
              className="relative group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-colors"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-dropdown"
          className="md:hidden bg-[#0d1017]/95 backdrop-blur-xl border-b border-slate-800 px-5 pt-4 pb-6 mt-3 shadow-2xl transition-all"
        >
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => handleNavClick('projects')}
              className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              Projects
            </button>
            <button
              onClick={() => handleNavClick('why-darex')}
              className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              Why Darex
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              Contact
            </button>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <PWAInstallButton variant="mobile-nav" />

              <a
                href={COMPANY_INFO.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/40 border border-blue-800/60 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                <span>Visit Darex (claritydarex.vercel.app)</span>
                <ExternalLink className="w-3 h-3 opacity-70" strokeWidth={1.5} />
              </a>

              <button
                onClick={() => handleNavClick('contact')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
