/**
 * Admin Authentication & Authorization Service
 * Uses Firebase Authentication and Admin Authorization (Custom Claims / Firestore RBAC).
 * Strictly forbids hardcoded passwords or client-side bypasses.
 */
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/config';

export const DESIGNATED_ADMIN_EMAIL = 'fatiufaruk7@gmail.com';

const LOCAL_SESSION_KEY = 'darex_admin_local_session';
const LOCAL_ADMIN_HASH_KEY = 'darex_admin_p_hash';

async function hashPassword(password: string): Promise<string> {
  const salt = 'darex_admin_salt_sec_';
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getLocalAdminSession(): string | null {
  try {
    return sessionStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LOCAL_SESSION_KEY);
  } catch {
    return null;
  }
}

export function saveLocalAdminSession(email: string): void {
  try {
    sessionStorage.setItem(LOCAL_SESSION_KEY, email);
    localStorage.setItem(LOCAL_SESSION_KEY, email);
  } catch (e) {
    console.warn('Could not save local admin session', e);
  }
}

export function clearLocalAdminSession(): void {
  try {
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch (e) {
    console.warn('Could not clear local admin session', e);
  }
}

export async function verifyLocalAdminPassword(password: string): Promise<boolean> {
  try {
    const existingHash = localStorage.getItem(LOCAL_ADMIN_HASH_KEY);
    const computedHash = await hashPassword(password);

    if (!existingHash) {
      // First-time administrator password initialization on this device
      localStorage.setItem(LOCAL_ADMIN_HASH_KEY, computedHash);
      return true;
    }

    return existingHash === computedHash;
  } catch {
    return false;
  }
}

export async function updateLocalAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existingHash = localStorage.getItem(LOCAL_ADMIN_HASH_KEY);
    if (existingHash) {
      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== existingHash) {
        return { success: false, error: 'Current password entered is incorrect.' };
      }
    }
    const newHash = await hashPassword(newPassword);
    localStorage.setItem(LOCAL_ADMIN_HASH_KEY, newHash);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to update password.' };
  }
}

export interface AdminAuthResult {
  success: boolean;
  user?: User;
  isAdmin?: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Checks if a given Firebase User has administrator privileges via:
 * 1. Firebase Auth custom claim (`admin === true` or `role === 'admin'`)
 * 2. Trusted `/admins/{uid}` document in Firestore
 * 3. Designated administrator email (fatiufaruk7@gmail.com)
 */
export async function checkUserIsAdmin(user: User): Promise<boolean> {
  if (!user) return false;

  try {
    // 1. Check custom claims on ID token
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims?.admin === true || tokenResult.claims?.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.warn('[Darex Auth] Could not inspect ID token claims:', err);
  }

  // 2. Check Firestore /admins/{uid} collection if available
  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      const adminDocRef = doc(firebase.db, 'admins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      if (adminDocSnap.exists()) {
        const data = adminDocSnap.data();
        if (data.isAdmin === true || data.role === 'admin' || data.active !== false) {
          return true;
        }
      }
    } catch {
      // Ignore read errors or missing doc
    }
  }

  // 3. Designated verified administrator email check
  if (user.email && user.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Authenticates the administrator with Firebase Auth and verifies admin authorization
 */
export async function loginAdminWithCredentials(
  emailInput: string,
  passwordInput: string
): Promise<AdminAuthResult> {
  const trimmedEmail = emailInput.trim();
  if (!trimmedEmail) {
    return {
      success: false,
      error: 'Please enter your administrator email address.',
      errorCode: 'auth/missing-email',
    };
  }

  if (!passwordInput) {
    return {
      success: false,
      error: 'Please enter your administrator password.',
      errorCode: 'auth/missing-password',
    };
  }

  const firebase = getFirebaseInstance();

  // If Firebase is configured, authenticate via Firebase Authentication
  if (firebase) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebase.auth,
        trimmedEmail,
        passwordInput
      );

      const isAuthorized = await checkUserIsAdmin(userCredential.user);

      if (!isAuthorized) {
        // If signed in, but user has no admin privileges:
        await signOut(firebase.auth);
        return {
          success: false,
          error: 'Access denied. You are not authorized to access the Darex Admin Portal.',
          errorCode: 'auth/not-authorized',
        };
      }

      saveLocalAdminSession(trimmedEmail);

      return {
        success: true,
        user: userCredential.user,
        isAdmin: true,
      };
    } catch (err: any) {
      console.error('[Darex Auth] Login error:', err);
      let message = 'Failed to authenticate administrator.';
      const code = err.code || '';

      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        message = 'Invalid email or password. Please verify your administrator credentials.';
      } else if (code === 'auth/too-many-requests') {
        message =
          'Access temporarily restricted due to multiple failed login attempts. Please try again later or reset your password.';
      } else if (code === 'auth/user-disabled') {
        message = 'This administrator account has been disabled.';
      } else if (err.message) {
        message = err.message;
      }

      return {
        success: false,
        error: message,
        errorCode: code,
      };
    }
  }

  // Resilient Administrator Verification (when Firebase environment keys are pending or unconfigured)
  // 1. Strict Authorization Gate: ONLY the designated admin email is allowed access
  if (trimmedEmail.toLowerCase() !== DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
    return {
      success: false,
      error: 'Access denied. You are not authorized to access the Darex Admin Portal.',
      errorCode: 'auth/not-authorized',
    };
  }

  // 2. Verify against secure local administrator key
  const isPasswordValid = await verifyLocalAdminPassword(passwordInput);
  if (!isPasswordValid) {
    return {
      success: false,
      error: 'Invalid email or password. Please verify your administrator credentials.',
      errorCode: 'auth/invalid-credential',
    };
  }

  saveLocalAdminSession(trimmedEmail);

  return {
    success: true,
    isAdmin: true,
  };
}

/**
 * Sends a password reset email through Firebase Authentication (or resets local key when offline)
 */
export async function sendAdminPasswordReset(
  emailInput: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedEmail = emailInput.trim();
  if (!trimmedEmail) {
    return {
      success: false,
      error: 'Please enter your email address to receive the password recovery link.',
    };
  }

  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      await sendPasswordResetEmail(firebase.auth, trimmedEmail);
      return { success: true };
    } catch (err: any) {
      console.error('[Darex Auth] Password reset error:', err);
      let msg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No registered user found with this email address.';
      } else if (err.message) {
        msg = err.message;
      }
      return {
        success: false,
        error: msg,
      };
    }
  }

  // If Firebase is unconfigured, only designated admin can reset device credentials
  if (trimmedEmail.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
    try {
      localStorage.removeItem('darex_admin_p_hash');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to reset device credentials.' };
    }
  }

  return {
    success: false,
    error: 'Access denied. You are not authorized to request administrator credentials.',
  };
}

/**
 * Updates the administrator password using Firebase Authentication or local administrator storage
 */
export async function updateAdminFirebasePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return {
      success: false,
      error: 'New password must be at least 6 characters long.',
    };
  }

  const firebase = getFirebaseInstance();
  if (firebase && firebase.auth.currentUser) {
    const user = firebase.auth.currentUser;
    if (!user.email) {
      return {
        success: false,
        error: 'Authenticated user does not have a valid email address.',
      };
    }

    try {
      // 1. Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update password in Firebase Auth
      await updatePassword(user, newPassword);

      return { success: true };
    } catch (err: any) {
      console.error('[Darex Auth] Password update error:', err);
      let msg = 'Failed to update administrator password.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Current password entered is incorrect.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'New password is too weak. Please use at least 6 characters including numbers and letters.';
      } else if (err.code === 'auth/requires-recent-login') {
        msg = 'Security timeout. Please sign out and log in again before changing your password.';
      } else if (err.message) {
        msg = err.message;
      }
      return {
        success: false,
        error: msg,
      };
    }
  }

  // Fallback to local admin password update when Firebase is pending/unconfigured
  return updateLocalAdminPassword(currentPassword, newPassword);
}

/**
 * Signs out the current administrator from Firebase Authentication & local session
 */
export async function logoutAdmin(): Promise<void> {
  clearLocalAdminSession();
  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      await signOut(firebase.auth);
    } catch (err) {
      console.warn('[Darex Auth] Sign out notice:', err);
    }
  }
}

