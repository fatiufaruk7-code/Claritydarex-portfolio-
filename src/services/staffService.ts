import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/config';
import type { StaffMember, StaffRole, StaffStatus } from '../types';
import { DESIGNATED_ADMIN_EMAIL } from '../constants/admin';

const STAFF_LOCAL_STORAGE_KEY = 'darex_staff_members_cache_v1';

// Initial default staff (Lead Architect / Super Admin)
export const DEFAULT_SUPER_ADMIN_STAFF: StaffMember = {
  id: 'staff_super_admin_faruk',
  fullName: 'Faruk Fatiu',
  email: DESIGNATED_ADMIN_EMAIL,
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  phone: '08137941486',
  createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
};

export function getCachedStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached staff', err);
  }
  return [DEFAULT_SUPER_ADMIN_STAFF];
}

export function saveCachedStaff(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STAFF_LOCAL_STORAGE_KEY, JSON.stringify(staff));
  } catch (err) {
    console.warn('Failed to cache staff', err);
  }
}

/**
 * Fetch all staff members from Firestore `staff` collection.
 */
export async function getStaffMembers(): Promise<StaffMember[]> {
  const firebase = getFirebaseInstance();
  const cached = getCachedStaff();

  if (!firebase) {
    return cached;
  }

  try {
    const q = query(collection(firebase.db, 'staff'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: StaffMember[] = [];

    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        fullName: d.fullName || 'Staff Member',
        email: d.email || '',
        avatarUrl: d.avatarUrl || '',
        phone: d.phone || '',
        role: (d.role as StaffRole) || 'SUPPORT',
        status: (d.status as StaffStatus) || 'ACTIVE',
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt,
        firebaseUid: d.firebaseUid,
      });
    });

    // Ensure the designated Super Admin is always present in list
    const hasSuperAdmin = list.some(
      (s) => s.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()
    );

    if (!hasSuperAdmin) {
      list.unshift(DEFAULT_SUPER_ADMIN_STAFF);
    }

    saveCachedStaff(list);
    return list;
  } catch (err) {
    console.warn('Could not fetch staff from Firestore, using cached records:', err);
    return cached;
  }
}

/**
 * Create a new staff member in Firestore.
 */
export async function createStaffMember(staffData: {
  fullName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  avatarUrl?: string;
  status?: StaffStatus;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const emailLower = staffData.email.trim().toLowerCase();
  if (!emailLower || !staffData.fullName.trim()) {
    return { success: false, error: 'Full name and email are required.' };
  }

  const staffId = `staff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newStaff: StaffMember = {
    id: staffId,
    fullName: staffData.fullName.trim(),
    email: emailLower,
    phone: staffData.phone?.trim() || '',
    role: staffData.role,
    status: staffData.status || 'ACTIVE',
    avatarUrl: staffData.avatarUrl || '',
    createdAt: new Date().toISOString(),
  };

  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      await setDoc(doc(firebase.db, 'staff', staffId), newStaff);
    } catch (err: unknown) {
      console.error('Error saving staff to Firestore:', err);
      // We will also update cache
    }
  }

  // Update local cache
  const current = getCachedStaff();
  const updated = [newStaff, ...current.filter((s) => s.email.toLowerCase() !== emailLower)];
  saveCachedStaff(updated);

  return { success: true, id: staffId };
}

/**
 * Update staff member in Firestore.
 */
export async function updateStaffMember(
  staffId: string,
  updates: Partial<Omit<StaffMember, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  const updatedAt = new Date().toISOString();
  const payload = { ...updates, updatedAt };

  if (firebase) {
    try {
      await setDoc(doc(firebase.db, 'staff', staffId), payload, { merge: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update staff member in Firestore.';
      return { success: false, error: message };
    }
  }

  // Update local cache
  const current = getCachedStaff();
  const updated = current.map((s) =>
    s.id === staffId ? { ...s, ...updates, updatedAt } : s
  );
  saveCachedStaff(updated);

  return { success: true };
}

/**
 * Toggle staff active/inactive status.
 */
export async function toggleStaffStatus(
  staffId: string,
  newStatus: StaffStatus
): Promise<{ success: boolean; error?: string }> {
  return updateStaffMember(staffId, { status: newStatus });
}

/**
 * Delete staff member record.
 */
export async function deleteStaffMember(
  staffId: string
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      await deleteDoc(doc(firebase.db, 'staff', staffId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove staff record from Firestore.';
      return { success: false, error: message };
    }
  }

  const current = getCachedStaff();
  saveCachedStaff(current.filter((s) => s.id !== staffId));
  return { success: true };
}

/**
 * Find staff member by email to identify their assigned role & status upon login.
 */
export async function getStaffRoleByEmail(
  email: string
): Promise<{
  isAuthorized: boolean;
  staff?: StaffMember;
  role: StaffRole;
  isActive: boolean;
  reason?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();

  // Primary developer & owner is ALWAYS SUPER_ADMIN
  if (cleanEmail === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
    return {
      isAuthorized: true,
      staff: DEFAULT_SUPER_ADMIN_STAFF,
      role: 'SUPER_ADMIN',
      isActive: true,
    };
  }

  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      // Query staff collection
      const q = query(collection(firebase.db, 'staff'));
      const snap = await getDocs(q);
      let foundStaff: StaffMember | null = null;

      snap.forEach((d) => {
        const data = d.data();
        if (data.email && data.email.toLowerCase() === cleanEmail) {
          foundStaff = {
            id: d.id,
            fullName: data.fullName || 'Staff Member',
            email: data.email,
            role: (data.role as StaffRole) || 'SUPPORT',
            status: (data.status as StaffStatus) || 'ACTIVE',
            createdAt: data.createdAt || new Date().toISOString(),
            phone: data.phone,
            avatarUrl: data.avatarUrl,
          };
        }
      });

      if (foundStaff) {
        if ((foundStaff as StaffMember).status === 'INACTIVE') {
          return {
            isAuthorized: false,
            staff: foundStaff,
            role: (foundStaff as StaffMember).role,
            isActive: false,
            reason: 'This staff account has been deactivated. Please contact the Super Administrator.',
          };
        }
        return {
          isAuthorized: true,
          staff: foundStaff,
          role: (foundStaff as StaffMember).role,
          isActive: true,
        };
      }
    } catch (err) {
      console.warn('Failed to query staff in Firestore, checking local cache:', err);
    }
  }

  // Fallback to cached staff
  const cached = getCachedStaff();
  const localMatch = cached.find((s) => s.email.toLowerCase() === cleanEmail);
  if (localMatch) {
    if (localMatch.status === 'INACTIVE') {
      return {
        isAuthorized: false,
        staff: localMatch,
        role: localMatch.role,
        isActive: false,
        reason: 'This staff account has been deactivated.',
      };
    }
    return {
      isAuthorized: true,
      staff: localMatch,
      role: localMatch.role,
      isActive: true,
    };
  }

  return {
    isAuthorized: false,
    role: 'SUPPORT',
    isActive: false,
    reason: 'Account not recognized in Darex Staff Directory.',
  };
}
