import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseEnvCheck {
  isConfigured: boolean;
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

export function checkFirebaseConfig(): FirebaseEnvCheck {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

  const missingKeys: string[] = [];
  if (!apiKey) missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!storageBucket) missingKeys.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missingKeys.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missingKeys.push('VITE_FIREBASE_APP_ID');

  const isConfigured = missingKeys.length === 0;

  return {
    isConfigured,
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
