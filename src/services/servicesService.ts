import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/config';
import { SERVICES_DATA } from '../data/services';
import type { ServiceItem } from '../types';

export const SERVICES_COLLECTION = 'services';

function parseTimestamp(val: any): string {
  if (!val) return new Date().toISOString();
  if (val && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function sanitizeServicePayload(data: Partial<ServiceItem>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function mapDocToService(id: string, data: Record<string, any>): ServiceItem {
  return {
    id,
    title: data.title || 'Untitled Service',
    description: data.description || '',
    iconName: data.iconName || 'Code2',
    tag: data.tag || 'Service Offering',
    features: Array.isArray(data.features) ? data.features : [],
    status: (data.status as 'ACTIVE' | 'DRAFT') || 'ACTIVE',
    pricing: data.pricing || '',
    order: typeof data.order === 'number' ? data.order : 0,
    createdAt: parseTimestamp(data.createdAt),
    updatedAt: parseTimestamp(data.updatedAt || data.createdAt),
    updatedBy: data.updatedBy || '',
  };
}

let isSeedingServices = false;

/**
 * Ensures initial default services are physically saved to Firestore if the collection is empty.
 * This guarantees all devices and browsers immediately have cloud-synchronized services in Firestore.
 */
export async function seedDefaultServicesIfEmpty(): Promise<void> {
  if (isSeedingServices) return;
  const firebase = getFirebaseInstance();
  if (!firebase) return;

  try {
    isSeedingServices = true;
    const colRef = collection(firebase.db, SERVICES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.info('[Darex Services] Initializing Firestore services collection with default offerings...');
      const now = new Date().toISOString();
      for (let i = 0; i < SERVICES_DATA.length; i++) {
        const initial = SERVICES_DATA[i];
        const docRef = doc(firebase.db, SERVICES_COLLECTION, initial.id);
        await setDoc(docRef, {
          title: initial.title,
          description: initial.description,
          iconName: initial.iconName,
          tag: initial.tag,
          features: initial.features,
          status: 'ACTIVE',
          pricing: 'Custom Scoped',
          order: i + 1,
          createdAt: now,
          updatedAt: now,
          updatedBy: 'System Bootstrap',
        });
      }
    }
  } catch (err) {
    console.warn('[Darex Services] Auto-seed services notice:', err);
  } finally {
    isSeedingServices = false;
  }
}

/**
 * Real-time listener for the Firestore `services` collection using onSnapshot().
 * Emits updates immediately whenever any administrator modifies, adds, or deletes a service.
 */
export function subscribeToServices(
  onUpdate: (services: ServiceItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    if (onError) onError(new Error('Firebase connection is not configured.'));
    onUpdate(
      SERVICES_DATA.map((s, idx) => ({
        ...s,
        status: 'ACTIVE',
        order: idx + 1,
        createdAt: new Date().toISOString(),
      }))
    );
    return () => {};
  }

  // Attempt to auto-seed if empty
  seedDefaultServicesIfEmpty().catch(() => {});

  try {
    const colRef = collection(firebase.db, SERVICES_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !isSeedingServices) {
          seedDefaultServicesIfEmpty().then(() => {}).catch(() => {});
        }

        const list: ServiceItem[] = snapshot.docs.map((d) =>
          mapDocToService(d.id, d.data())
        );

        onUpdate(list);
      },
      (err) => {
        console.error('[Darex Services] Real-time listener error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[Darex Services] Error starting listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Get all services directly from Firestore once.
 */
export async function getServices(): Promise<ServiceItem[]> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return SERVICES_DATA.map((s, idx) => ({
      ...s,
      status: 'ACTIVE',
      order: idx + 1,
      createdAt: new Date().toISOString(),
    }));
  }

  try {
    const colRef = collection(firebase.db, SERVICES_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      await seedDefaultServicesIfEmpty();
      const retrySnap = await getDocs(q);
      return retrySnap.docs.map((d) => mapDocToService(d.id, d.data()));
    }
    return snap.docs.map((d) => mapDocToService(d.id, d.data()));
  } catch (err) {
    console.warn('[Darex Services] getServices error:', err);
    return SERVICES_DATA.map((s, idx) => ({
      ...s,
      status: 'ACTIVE',
      order: idx + 1,
      createdAt: new Date().toISOString(),
    }));
  }
}

/**
 * Add a new service to Firestore.
 */
export async function createService(
  payload: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
  actorEmail?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  const trimmedTitle = payload.title?.trim();
  if (!trimmedTitle) {
    return { success: false, error: 'Service title is required.' };
  }

  try {
    const customId = `service_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(firebase.db, SERVICES_COLLECTION, customId);
    const docData = sanitizeServicePayload({
      title: trimmedTitle,
      description: payload.description?.trim() || '',
      iconName: payload.iconName?.trim() || 'Code2',
      tag: payload.tag?.trim() || 'Core Capability',
      features: Array.isArray(payload.features) ? payload.features.filter(Boolean) : [],
      status: payload.status || 'ACTIVE',
      pricing: payload.pricing?.trim() || 'Custom Scoped',
      order: typeof payload.order === 'number' ? payload.order : Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail || 'Super Admin',
    });

    await setDoc(docRef, {
      ...docData,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    });

    return { success: true, id: customId };
  } catch (err: any) {
    console.error('[Darex Services] Create service error:', err);
    return { success: false, error: err?.message || 'Failed to save service to Firestore.' };
  }
}

/**
 * Update an existing service in Firestore.
 */
export async function updateService(
  id: string,
  updates: Partial<ServiceItem>,
  actorEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    const docRef = doc(firebase.db, SERVICES_COLLECTION, id);
    const sanitized = sanitizeServicePayload({
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail || 'Super Admin',
    });

    await updateDoc(docRef, {
      ...sanitized,
      updatedAtServer: serverTimestamp(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Darex Services] Update service error:', err);
    return { success: false, error: err?.message || 'Failed to update service in Firestore.' };
  }
}

/**
 * Delete a service from Firestore.
 */
export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    const docRef = doc(firebase.db, SERVICES_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    console.error('[Darex Services] Delete service error:', err);
    return { success: false, error: err?.message || 'Failed to delete service from Firestore.' };
  }
}

/**
 * Toggle active / draft status of a service in Firestore.
 */
export async function toggleServiceStatus(
  id: string,
  currentStatus: 'ACTIVE' | 'DRAFT',
  actorEmail?: string
): Promise<{ success: boolean; newStatus: 'ACTIVE' | 'DRAFT'; error?: string }> {
  const newStatus: 'ACTIVE' | 'DRAFT' = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
  const res = await updateService(id, { status: newStatus }, actorEmail);
  return { success: res.success, newStatus, error: res.error };
}
