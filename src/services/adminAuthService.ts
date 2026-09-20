/**
 * Admin Authentication & Credential Management Service
 * Supports authorized administrator login for Faruk Fatiu (fatiufaruk7@gmail.com)
 * with configurable persistent password (defaulting to 12345).
 */

const ADMIN_EMAIL = 'fatiufaruk7@gmail.com';
const DEFAULT_PASSWORD = '12345';
const PASSWORD_STORAGE_KEY = 'darex_admin_password';
const SESSION_STORAGE_KEY = 'darex_admin_session';

export interface AdminUserSession {
  email: string;
  name: string;
  role: string;
  loggedAt: number;
}

/**
 * Gets the current configured admin password from local storage or returns the default
 */
export function getStoredAdminPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_PASSWORD;
  const stored = localStorage.getItem(PASSWORD_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PASSWORD_STORAGE_KEY, DEFAULT_PASSWORD);
    return DEFAULT_PASSWORD;
  }
  return stored;
}

/**
 * Checks if a session currently exists and is valid
 */
export function getActiveAdminSession(): AdminUserSession | null {
  if (typeof window === 'undefined') return null;
  const sessionStr = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr) as AdminUserSession;
    if (session.email && session.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return session;
    }
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
  return null;
}

/**
 * Verifies email and password credentials for administrator login
 */
export function authenticateAdmin(
  emailInput: string,
  passwordInput: string
): { success: boolean; error?: string; session?: AdminUserSession } {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const currentPassword = getStoredAdminPassword();

  if (normalizedEmail !== ADMIN_EMAIL.toLowerCase()) {
    return {
      success: false,
      error: `Access restricted. Only the designated administrator (${ADMIN_EMAIL}) has portal privileges.`,
    };
  }

  if (passwordInput !== currentPassword) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your administrator passcode.',
    };
  }

  const session: AdminUserSession = {
    email: ADMIN_EMAIL,
    name: 'Faruk Fatiu',
    role: 'Super Administrator',
    loggedAt: Date.now(),
  };

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  return {
    success: true,
    session,
  };
}

/**
 * Updates the administrator password
 */
export function updateAdminPassword(
  currentPasswordInput: string,
  newPasswordInput: string
): { success: boolean; error?: string } {
  const currentStored = getStoredAdminPassword();

  if (currentPasswordInput !== currentStored) {
    return {
      success: false,
      error: 'Current password does not match.',
    };
  }

  const trimmedNew = newPasswordInput.trim();
  if (trimmedNew.length < 4) {
    return {
      success: false,
      error: 'New password must be at least 4 characters long.',
    };
  }

  localStorage.setItem(PASSWORD_STORAGE_KEY, trimmedNew);
  return { success: true };
}

/**
 * Clears current administrator session
 */
export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Resets admin password back to the default initial passcode ('12345')
 */
export function resetAdminPasswordToDefault(): void {
  localStorage.setItem(PASSWORD_STORAGE_KEY, DEFAULT_PASSWORD);
}
