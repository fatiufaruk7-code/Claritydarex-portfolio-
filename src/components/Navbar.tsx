import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'admin';
  onNavigateToView: (view: 'home' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigateToView }) => {
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
    if (currentView !== 'home') {
      onNavigateToView('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
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
            className="flex items-center gap-3 group focus:outline-none"
            id="navbar-brand-link"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="w-full h-full bg-[#090a0f] rounded-[11px] flex items-center justify-center font-bold text-lg text-white font-mono tracking-wider">
                <span className="text-blue-500">D</span>X
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                DAREX
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase -mt-1">
                Digital Systems
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          {currentView === 'home' ? (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
              <button
                onClick={() => handleNavClick('home')}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick('projects')}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Projects
              </button>
              <button
                onClick={() => handleNavClick('why-darex')}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Why Darex
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Contact
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-xs text-blue-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Protected Admin Portal
              </span>
              <button
                onClick={() => onNavigateToView('home')}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Return to Public Website
              </button>
            </div>
          )}

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentView === 'home' ? (
              <button
                onClick={() => handleNavClick('contact')}
                id="navbar-get-started-btn"
                className="relative group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-600/30 hover:shadow-blue-600/50"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigateToView('home')}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                View Live Site
              </button>
            )}
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
          {currentView === 'home' ? (
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
                onClick={() => handleNavClick('contact')}
                className="text-left px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                Contact
              </button>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleNavClick('contact')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
                >
                  <span>Get Started</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Darex Administrator Console</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToView('home');
                }}
                className="w-full py-3 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Return to Public Website
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
