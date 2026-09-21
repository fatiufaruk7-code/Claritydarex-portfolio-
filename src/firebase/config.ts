import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseEnvCheck {
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
  missingKeys: string[];
  config: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  };
}

const FIREBASE_CONFIG_STORAGE_KEY = 'darex_custom_firebase_config';

export function getCustomFirebaseConfig(): {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
} | null {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomFirebaseConfig(config: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}): void {
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    cachedApp = null;
    cachedAuth = null;
    cachedDb = null;
  } catch (e) {
    console.warn('Could not save custom Firebase config to localStorage', e);
  }
}

export function clearCustomFirebaseConfig(): void {
  try {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    cachedApp = null;
    cachedAuth = null;
    cachedDb = null;
  } catch (e) {
    console.warn('Could not clear custom Firebase config', e);
  }
}

export function checkFirebaseConfig(): FirebaseEnvCheck {
  const custom = getCustomFirebaseConfig();

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || custom?.apiKey;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || custom?.authDomain;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || custom?.projectId;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || custom?.storageBucket;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || custom?.messagingSenderId;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID || custom?.appId;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || custom?.measurementId;

  const missingKeys: string[] = [];
  if (!apiKey) missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!storageBucket) missingKeys.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missingKeys.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missingKeys.push('VITE_FIREBASE_APP_ID');

  const isConfigured = missingKeys.length === 0;
  const source: 'env' | 'custom' | 'none' = isConfigured
    ? import.meta.env.VITE_FIREBASE_API_KEY
      ? 'env'
      : 'custom'
    : 'none';

  return {
    isConfigured,
    source,
    missingKeys,
    config: {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
    },
  };
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseInstance(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} | null {
  const { isConfigured, config, missingKeys } = checkFirebaseConfig();

  if (!isConfigured) {
    console.warn(
      `[Darex Firebase] Missing configuration keys in environment: ${missingKeys.join(', ')}. ` +
      `Add these to your .env file or hosting provider (e.g. Vercel) dashboard.`
    );
    return null;
  }

  if (!cachedApp) {
    try {
      cachedApp = getApps().length > 0 ? getApp() : initializeApp(config);
      cachedAuth = getAuth(cachedApp);
      cachedDb = getFirestore(cachedApp);
    } catch (err) {
      console.error('[Darex Firebase] Error initializing Firebase app:', err);
      return null;
    }
  }

  return {
    app: cachedApp,
    auth: cachedAuth!,
    db: cachedDb!,
  };
}
