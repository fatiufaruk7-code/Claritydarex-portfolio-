import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { SiteSettings } from '../types';
import {
  DEFAULT_SITE_SETTINGS,
  getCachedSiteSettings,
  subscribeToSiteSettings,
  updateSiteSettings as updateSiteSettingsApi,
  getSiteSettings as fetchSiteSettingsDirectly,
  type SiteSettingsSnapshotMeta,
} from '../services/siteSettingsService';

export interface RemoteUpdateAlert {
  updatedBy: string;
  updatedAt: string;
  receivedAt: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  lastRemoteUpdate: RemoteUpdateAlert | null;
  clearRemoteUpdateAlert: () => void;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: SiteSettings, userEmail?: string) => Promise<{ success: boolean; error?: string }>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  isLoading: true,
  isRealtimeConnected: false,
  lastRemoteUpdate: null,
  clearRemoteUpdateAlert: () => {},
  refreshSettings: async () => {},
  updateSettings: async () => ({ success: false, error: 'Provider not initialized' }),
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(getCachedSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState<RemoteUpdateAlert | null>(null);

  const prevUpdatedAtRef = useRef<string | undefined>(settings.updatedAt);
  const isSelfSavingRef = useRef<boolean>(false);

  useEffect(() => {
    // Subscribe to Firestore changes with real-time onSnapshot
    const unsubscribe = subscribeToSiteSettings((latest, meta: SiteSettingsSnapshotMeta) => {
      setIsRealtimeConnected(meta.isRealtimeConnected);
      setIsLoading(false);

      // Detect if update originated remotely from another session
      if (
        latest.updatedAt &&
        prevUpdatedAtRef.current &&
        latest.updatedAt !== prevUpdatedAtRef.current &&
        !meta.hasPendingWrites &&
        !isSelfSavingRef.current
      ) {
        setLastRemoteUpdate({
          updatedBy: latest.updatedBy || 'Another administrator',
          updatedAt: latest.updatedAt,
          receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }

      prevUpdatedAtRef.current = latest.updatedAt;
      setSettings(latest);

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
    isSelfSavingRef.current = true;
    try {
      const res = await updateSiteSettingsApi(newSettings, userEmail);
      if (res.success) {
        prevUpdatedAtRef.current = newSettings.updatedAt;
        setSettings(newSettings);
      }
      return res;
    } finally {
      setTimeout(() => {
        isSelfSavingRef.current = false;
      }, 1200);
    }
  };

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const latest = await fetchSiteSettingsDirectly();
      setSettings(latest);
      prevUpdatedAtRef.current = latest.updatedAt;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRemoteUpdateAlert = useCallback(() => {
    setLastRemoteUpdate(null);
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        isRealtimeConnected,
        lastRemoteUpdate,
        clearRemoteUpdateAlert,
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
