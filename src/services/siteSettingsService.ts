import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/config';
import type { SiteSettings } from '../types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  general: {
    companyName: 'Darex',
    companyDescription: 'Building Digital Solutions That Move Businesses Forward. Full-cycle engineering, modern design, and enterprise-grade web development.',
    location: 'Lagos, Nigeria (Serving Clients Worldwide)',
    businessHours: 'Mon - Sat: 9:00 AM - 6:00 PM (WAT)',
  },
  contact: {
    email: 'fatiufaruk7@gmail.com',
    phone: '08137941486',
    whatsappNumber: '+2348137941486',
  },
  socialMedia: {
    instagram: 'https://www.instagram.com/farukfatiu?stkn=OW03andjamthMDd5',
    twitter: '',
    github: '',
    whatsapp: 'https://wa.me/2348137941486',
  },
  hero: {
    headline: 'Building Digital Solutions That Move Businesses Forward.',
    description: 'Darex provides modern digital solutions designed to help businesses grow, improve their online presence, and operate more efficiently with resilient, custom software architecture.',
    primaryButtonText: 'Get Started',
    primaryButtonUrl: '#contact',
  },
  footer: {
    description: 'Building digital solutions that move businesses forward. Full-cycle engineering, modern design, and enterprise-grade web development.',
    copyrightText: 'Darex. All rights reserved.',
  },
  seo: {
    title: 'Darex — Building Digital Solutions That Move Businesses Forward',
    description: 'Darex — Building Digital Solutions That Move Businesses Forward. Full-cycle engineering, modern design, and enterprise-grade web development.',
    ogImageUrl: '/pwa-512x512.png',
  },
};

const LOCAL_STORAGE_SETTINGS_KEY = 'darex_site_settings_cache_v1';

export function getCachedSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        general: { ...DEFAULT_SITE_SETTINGS.general, ...(parsed.general || {}) },
        contact: { ...DEFAULT_SITE_SETTINGS.contact, ...(parsed.contact || {}) },
        socialMedia: { ...DEFAULT_SITE_SETTINGS.socialMedia, ...(parsed.socialMedia || {}) },
        hero: { ...DEFAULT_SITE_SETTINGS.hero, ...(parsed.hero || {}) },
        footer: { ...DEFAULT_SITE_SETTINGS.footer, ...(parsed.footer || {}) },
        seo: { ...DEFAULT_SITE_SETTINGS.seo, ...(parsed.seo || {}) },
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached site settings', err);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveCachedSiteSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save cached site settings', err);
  }
}

/**
 * Fetch site settings from Firestore collection `siteSettings`, document `main`.
 * Falls back to cached or default settings.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return getCachedSiteSettings();
  }

  try {
    const docRef = doc(firebase.db, 'siteSettings', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<SiteSettings>;
      const merged: SiteSettings = {
        general: { ...DEFAULT_SITE_SETTINGS.general, ...(data.general || {}) },
        contact: { ...DEFAULT_SITE_SETTINGS.contact, ...(data.contact || {}) },
        socialMedia: { ...DEFAULT_SITE_SETTINGS.socialMedia, ...(data.socialMedia || {}) },
        hero: { ...DEFAULT_SITE_SETTINGS.hero, ...(data.hero || {}) },
        footer: { ...DEFAULT_SITE_SETTINGS.footer, ...(data.footer || {}) },
        seo: { ...DEFAULT_SITE_SETTINGS.seo, ...(data.seo || {}) },
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      };
      saveCachedSiteSettings(merged);
      return merged;
    } else {
      // Document doesn't exist yet, save default
      return getCachedSiteSettings();
    }
  } catch (err) {
    console.warn('Firestore getSiteSettings error, falling back to cache:', err);
    return getCachedSiteSettings();
  }
}

// Helper to sanitize payload for Firestore (stripping any undefined values)
function sanitizeForFirestore<T>(item: T): T {
  if (item === undefined || item === null) {
    return '' as unknown as T;
  }
  if (typeof item !== 'object') {
    return item;
  }
  if (Array.isArray(item)) {
    return item.map(sanitizeForFirestore) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
    if (value === undefined) {
      result[key] = '';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Update site settings in Firestore document `siteSettings/main`.
 */
export async function updateSiteSettings(
  settings: SiteSettings,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const rawPayload: SiteSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail || 'Super Admin',
  };

  const payload = sanitizeForFirestore(rawPayload);
  saveCachedSiteSettings(payload);

  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: true };
  }

  try {
    const docRef = doc(firebase.db, 'siteSettings', 'main');
    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save site settings to Firestore.';
    console.error('Failed to update site settings in Firestore:', err);
    return { success: false, error: message };
  }
}

export interface SiteSettingsSnapshotMeta {
  hasPendingWrites?: boolean;
  fromCache?: boolean;
  isRealtimeConnected: boolean;
}

/**
 * Subscribe to realtime changes of siteSettings/main.
 * Emits updates immediately when any admin modifies the document in Firestore.
 */
export function subscribeToSiteSettings(
  callback: (settings: SiteSettings, meta: SiteSettingsSnapshotMeta) => void
): () => void {
  let isUnsubscribed = false;
  let unsubscribeFirestore: (() => void) | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  // Immediate cached return so UI renders without waiting
  const initialCache = getCachedSiteSettings();
  callback(initialCache, { isRealtimeConnected: false, fromCache: true });

  const trySubscribe = () => {
    if (isUnsubscribed) return;

    const firebase = getFirebaseInstance();
    if (!firebase) {
      // Retry in 1.2 seconds if Firebase is hydrating
      retryTimer = setTimeout(trySubscribe, 1200);
      return;
    }

    try {
      const docRef = doc(firebase.db, 'siteSettings', 'main');
      unsubscribeFirestore = onSnapshot(
        docRef,
        { includeMetadataChanges: true },
        (docSnap) => {
          if (isUnsubscribed) return;

          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<SiteSettings>;
            const merged: SiteSettings = {
              general: { ...DEFAULT_SITE_SETTINGS.general, ...(data.general || {}) },
              contact: { ...DEFAULT_SITE_SETTINGS.contact, ...(data.contact || {}) },
              socialMedia: { ...DEFAULT_SITE_SETTINGS.socialMedia, ...(data.socialMedia || {}) },
              hero: { ...DEFAULT_SITE_SETTINGS.hero, ...(data.hero || {}) },
              footer: { ...DEFAULT_SITE_SETTINGS.footer, ...(data.footer || {}) },
              seo: { ...DEFAULT_SITE_SETTINGS.seo, ...(data.seo || {}) },
              updatedAt: data.updatedAt,
              updatedBy: data.updatedBy,
            };
            saveCachedSiteSettings(merged);
            callback(merged, {
              hasPendingWrites: docSnap.metadata.hasPendingWrites,
              fromCache: docSnap.metadata.fromCache,
              isRealtimeConnected: true,
            });
          } else {
            callback(getCachedSiteSettings(), {
              hasPendingWrites: docSnap.metadata.hasPendingWrites,
              fromCache: docSnap.metadata.fromCache,
              isRealtimeConnected: true,
            });
          }
        },
        (error) => {
          console.warn('Site settings snapshot error:', error);
          if (!isUnsubscribed) {
            callback(getCachedSiteSettings(), { isRealtimeConnected: false, fromCache: true });
          }
        }
      );
    } catch (err) {
      console.warn('Error subscribing to site settings:', err);
      if (!isUnsubscribed) {
        callback(getCachedSiteSettings(), { isRealtimeConnected: false, fromCache: true });
      }
    }
  };

  trySubscribe();

  return () => {
    isUnsubscribed = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}
