import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/config';
import type { StaffMember, StaffRole, StaffStatus } from '../types';
import { DESIGNATED_ADMIN_EMAIL } from '../constants/admin';

// Initial default Super Admin staff record (Lead Architect / Owner)
export const DEFAULT_SUPER_ADMIN_STAFF: StaffMember = {
  id: 'staff_super_admin_faruk',
  fullName: 'Faruk Fatiu',
  email: DESIGNATED_ADMIN_EMAIL,
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  phone: '08137941486',
  createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
};

/**
 * Formats Firestore errors into clear, human-actionable instructions.
 */
export function formatFirestoreError(err: unknown): string {
  if (!err) return 'An unexpected error occurred.';
  const message = err instanceof Error ? err.message : String(err);
  if (
    message.includes('Cloud Firestore API has not been used') ||
    message.includes('SERVICE_DISABLED') ||
    message.includes('PERMISSION_DENIED')
  ) {
    return (
      'Cloud Firestore database is not yet enabled for project "darex-portfolio". ' +
      'Please open Firebase Console (https://console.firebase.google.com/project/darex-portfolio/firestore) and click "Create database" to activate cloud synchronization.'
    );
  }
  return message;
}

/**
 * Ensures the primary Super Admin profile is physically seeded into the Firestore `staff` collection.
 * This guarantees both Chrome and Opera Mini see the lead administrator directly in Firestore.
 */
export async function ensureSuperAdminInFirestore(): Promise<void> {
  const firebase = getFirebaseInstance();
  if (!firebase) return;

  try {
    const adminDocRef = doc(firebase.db, 'staff', DEFAULT_SUPER_ADMIN_STAFF.id);
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
      await setDoc(adminDocRef, DEFAULT_SUPER_ADMIN_STAFF, { merge: true });
    }
  } catch (err) {
    // Non-blocking initialization
    console.warn('[StaffService] Auto-seed Super Admin notice:', err);
  }
}

/**
 * Real-time listener for the Firestore `staff` collection using onSnapshot().
 * Synchronizes staff member records and total counts across all active browser
 * tabs, devices (Chrome, Opera Mini, etc.), and sessions in real time.
 */
export function subscribeToStaffMembers(
  onUpdate: (staff: StaffMember[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const firebase = getFirebaseInstance();

  if (!firebase) {
    if (onError) onError(new Error('Firebase is not initialized.'));
    onUpdate([DEFAULT_SUPER_ADMIN_STAFF]);
    return () => {};
  }

  // Attempt to auto-seed super admin record if not yet created
  ensureSuperAdminInFirestore().catch(() => {});

  const staffCol = collection(firebase.db, 'staff');

  const processSnapshot = (snapshotDocs: Array<{ id: string; data: () => Record<string, any> }>): StaffMember[] => {
    const list: StaffMember[] = [];

    snapshotDocs.forEach((docSnap) => {
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

    return list;
  };

  let activeUnsubscribe: Unsubscribe = () => {};
  let isUnsubscribed = false;

  try {
    const q = query(staffCol, orderBy('createdAt', 'desc'));

    activeUnsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (isUnsubscribed) return;
        const staffList = processSnapshot(snapshot.docs);
        onUpdate(staffList);
      },
      (err) => {
        if (isUnsubscribed) return;
        console.warn('[StaffService] onSnapshot orderBy query error, falling back to direct collection listener:', err);

        // Fallback: If compound index or ordering fails, subscribe directly to collection and sort in memory
        try {
          activeUnsubscribe = onSnapshot(
            staffCol,
            (fallbackSnap) => {
              if (isUnsubscribed) return;
              const fallbackList = processSnapshot(fallbackSnap.docs);
              fallbackList.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              onUpdate(fallbackList);
            },
            (fallbackErr) => {
              if (isUnsubscribed) return;
              console.error('[StaffService] Firestore staff listener error:', fallbackErr);
              onUpdate([DEFAULT_SUPER_ADMIN_STAFF]);
              if (onError) onError(new Error(formatFirestoreError(fallbackErr)));
            }
          );
        } catch (innerErr: any) {
          if (isUnsubscribed) return;
          onUpdate([DEFAULT_SUPER_ADMIN_STAFF]);
          if (onError) onError(new Error(formatFirestoreError(innerErr)));
        }
      }
    );
  } catch (err: any) {
    console.error('[StaffService] Failed to establish Firestore staff subscription:', err);
    onUpdate([DEFAULT_SUPER_ADMIN_STAFF]);
    if (onError) onError(new Error(formatFirestoreError(err)));
    return () => {};
  }

  return () => {
    isUnsubscribed = true;
    try {
      activeUnsubscribe();
    } catch {
      // ignore
    }
  };
}

/**
 * Fetch all staff members directly from Firestore `staff` collection (Single Source of Truth).
 */
export async function getStaffMembers(): Promise<StaffMember[]> {
  const firebase = getFirebaseInstance();

  if (!firebase) {
    return [DEFAULT_SUPER_ADMIN_STAFF];
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

    const hasSuperAdmin = list.some(
      (s) => s.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()
    );

    if (!hasSuperAdmin) {
      list.unshift(DEFAULT_SUPER_ADMIN_STAFF);
    }

    return list;
  } catch (err) {
    console.warn('[StaffService] Failed getDocs with orderBy, attempting collection fallback:', err);
    try {
      const snapshot = await getDocs(collection(firebase.db, 'staff'));
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

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const hasSuperAdmin = list.some(
        (s) => s.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()
      );

      if (!hasSuperAdmin) {
        list.unshift(DEFAULT_SUPER_ADMIN_STAFF);
      }

      return list;
    } catch (fallbackErr: any) {
      console.error('[StaffService] Firestore read error:', fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Create a new staff member document in Firestore `staff` collection.
 * Writes directly to Firestore and does NOT use browser-local storage.
 */
export async function createStaffMember(staffData: {
  fullName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  avatarUrl?: string;
  status?: StaffStatus;
  firebaseUid?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const emailLower = staffData.email.trim().toLowerCase();
  const trimmedName = staffData.fullName.trim();

  if (!emailLower || !trimmedName) {
    return { success: false, error: 'Full name and email address are required.' };
  }

  const firebase = getFirebaseInstance();
  if (!firebase) {
    return {
      success: false,
      error: 'Firebase is not initialized. Please verify your connection to project darex-portfolio.',
    };
  }

  // Use firebaseUid as document ID if provided, otherwise a clean unique id
  const staffId = staffData.firebaseUid || `staff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newStaff: StaffMember = {
    id: staffId,
    fullName: trimmedName,
    email: emailLower,
    phone: staffData.phone?.trim() || '',
    role: staffData.role,
    status: staffData.status || 'ACTIVE',
    avatarUrl: staffData.avatarUrl?.trim() || '',
    createdAt: new Date().toISOString(),
    ...(staffData.firebaseUid ? { firebaseUid: staffData.firebaseUid } : {}),
  };

  try {
    await setDoc(doc(firebase.db, 'staff', staffId), newStaff);
    return { success: true, id: staffId };
  } catch (err: unknown) {
    console.error('[StaffService] Firestore write failed:', err);
    return { success: false, error: formatFirestoreError(err) };
  }
}

/**
 * Update an existing staff member in Firestore `staff` collection.
 */
export async function updateStaffMember(
  staffId: string,
  updates: Partial<Omit<StaffMember, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  const updatedAt = new Date().toISOString();
  const payload: Record<string, any> = { updatedAt };

  if (updates.fullName !== undefined) payload.fullName = updates.fullName.trim();
  if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
  if (updates.phone !== undefined) payload.phone = updates.phone.trim();
  if (updates.avatarUrl !== undefined) payload.avatarUrl = updates.avatarUrl.trim();
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.firebaseUid !== undefined) payload.firebaseUid = updates.firebaseUid;

  try {
    await setDoc(doc(firebase.db, 'staff', staffId), payload, { merge: true });
    return { success: true };
  } catch (err: unknown) {
    console.error('[StaffService] Error updating staff member in Firestore:', err);
    return { success: false, error: formatFirestoreError(err) };
  }
}

/**
 * Toggle staff active/inactive status in Firestore.
 */
export async function toggleStaffStatus(
  staffId: string,
  newStatus: StaffStatus
): Promise<{ success: boolean; error?: string }> {
  return updateStaffMember(staffId, { status: newStatus });
}

/**
 * Delete a staff member document from Firestore `staff` collection.
 */
export async function deleteStaffMember(
  staffId: string
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    await deleteDoc(doc(firebase.db, 'staff', staffId));
    return { success: true };
  } catch (err: unknown) {
    console.error('[StaffService] Error deleting staff record from Firestore:', err);
    return { success: false, error: formatFirestoreError(err) };
  }
}

/**
 * Find staff member by email in Firestore to verify assigned role and status.
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
      const snap = await getDocs(collection(firebase.db, 'staff'));
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
            firebaseUid: data.firebaseUid,
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
      console.warn('[StaffService] Firestore query error in getStaffRoleByEmail:', err);
    }
  }

  return {
    isAuthorized: false,
    role: 'SUPPORT',
    isActive: false,
    reason: 'Account not recognized in Darex Staff Directory.',
  };
}
