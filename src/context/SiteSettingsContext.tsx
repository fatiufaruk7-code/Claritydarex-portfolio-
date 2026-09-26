import React, { createContext, useContext } from 'react';
import type { SiteSettings } from '../types';
import { COMPANY_INFO } from '../data/company';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  general: {
    companyName: COMPANY_INFO.name,
    companyDescription:
      'Building Digital Solutions That Move Businesses Forward. Full-cycle engineering, modern design, and enterprise-grade web development.',
    location: COMPANY_INFO.location,
    businessHours: 'Mon - Sat: 9:00 AM - 6:00 PM (WAT)',
  },
  contact: {
    email: COMPANY_INFO.email,
    phone: COMPANY_INFO.phone,
    whatsappNumber: '+2348137941486',
  },
  socialMedia: {
    instagram: COMPANY_INFO.socialLinks.instagram,
    twitter: COMPANY_INFO.socialLinks.twitter,
    github: COMPANY_INFO.socialLinks.github,
    whatsapp: COMPANY_INFO.socialLinks.whatsapp,
  },
  hero: {
    headline: COMPANY_INFO.tagline,
    description: COMPANY_INFO.subheadline,
    primaryButtonText: 'Get Started',
    primaryButtonUrl: '#contact',
  },
  footer: {
    description:
      'Building digital solutions that move businesses forward. Full-cycle engineering, modern design, and enterprise-grade web development.',
    copyrightText: 'Darex Digital Systems. All rights reserved.',
  },
  seo: {
    title: 'Darex — Building Digital Solutions That Move Businesses Forward',
    description:
      'Darex delivers custom web development, UI/UX design, e-commerce infrastructure, and scalable cloud solutions built with modern technology.',
    ogImageUrl: '/pwa-512x512.png',
  },
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  isLoading: false,
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SiteSettingsContext.Provider
      value={{
        settings: DEFAULT_SITE_SETTINGS,
        isLoading: false,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export function useSiteSettings(): SiteSettingsContextType {
  return useContext(SiteSettingsContext);
}
