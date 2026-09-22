import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SiteSettings } from '../types';
import {
  DEFAULT_SITE_SETTINGS,
  getCachedSiteSettings,
  subscribeToSiteSettings,
  updateSiteSettings as updateSiteSettingsApi,
} from '../services/siteSettingsService';

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refreshSettings: () => void;
  updateSettings: (newSettings: SiteSettings, userEmail?: string) => Promise<{ success: boolean; error?: string }>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  isLoading: true,
  refreshSettings: () => {},
  updateSettings: async () => ({ success: false, error: 'Provider not initialized' }),
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(getCachedSiteSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firestore changes
    const unsubscribe = subscribeToSiteSettings((latest) => {
      setSettings(latest);
      setIsLoading(false);

      // Dynamically update document title & meta tags if available
      if (latest.seo?.title) {
        document.title = latest.seo.title;
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && latest.seo?.description) {
        metaDesc.setAttribute('content', latest.seo.description);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: SiteSettings, userEmail?: string) => {
    const res = await updateSiteSettingsApi(newSettings, userEmail);
    if (res.success) {
      setSettings(newSettings);
    }
    return res;
  };

  const refreshSettings = () => {
    setSettings(getCachedSiteSettings());
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export function useSiteSettings(): SiteSettingsContextType {
  return useContext(SiteSettingsContext);
}
