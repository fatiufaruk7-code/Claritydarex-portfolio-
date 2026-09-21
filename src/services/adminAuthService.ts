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
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Please set your Firebase credentials in your environment variables.',
      errorCode: 'auth/not-configured',
    };
  }

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

/**
 * Sends a password reset email through Firebase Authentication
 */
export async function sendAdminPasswordReset(
  emailInput: string
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return {
      success: false,
      error: 'Firebase is not configured.',
    };
  }

  const trimmedEmail = emailInput.trim();
  if (!trimmedEmail) {
    return {
      success: false,
      error: 'Please enter your email address to receive the password recovery link.',
    };
  }

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

/**
 * Updates the administrator password using Firebase Authentication
 * Reauthenticates the user with current credentials first for security
 */
export async function updateAdminFirebasePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase || !firebase.auth.currentUser) {
    return {
      success: false,
      error: 'No authenticated administrator session found. Please sign in again.',
    };
  }

  const user = firebase.auth.currentUser;
  if (!user.email) {
    return {
      success: false,
      error: 'Authenticated user does not have a valid email address.',
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      error: 'New password must be at least 6 characters long.',
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

/**
 * Signs out the current administrator from Firebase Authentication
 */
export async function logoutAdmin(): Promise<void> {
  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      await signOut(firebase.auth);
    } catch (err) {
      console.warn('[Darex Auth] Sign out notice:', err);
    }
  }
}

