import {
  collection,
  doc,
  getDocs,
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
import { COMMITMENTS_DATA } from '../data/testimonials';
import type { TestimonialItem, CommitmentItem } from '../types';

export const TESTIMONIALS_COLLECTION = 'testimonials';
export const COMMITMENTS_COLLECTION = 'commitments';

function parseTimestamp(val: any): string {
  if (!val) return new Date().toISOString();
  if (val && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function sanitizePayload(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function mapDocToTestimonial(id: string, data: Record<string, any>): TestimonialItem {
  return {
    id,
    clientName: data.clientName || 'Anonymous Client',
    clientRole: data.clientRole || '',
    company: data.company || '',
    avatarText: data.avatarText || (data.clientName ? data.clientName.substring(0, 2).toUpperCase() : 'DX'),
    quote: data.quote || '',
    rating: typeof data.rating === 'number' ? data.rating : 5,
    projectDelivered: data.projectDelivered || 'Web Solution',
    published: data.published !== false,
    order: typeof data.order === 'number' ? data.order : 0,
    createdAt: parseTimestamp(data.createdAt),
    updatedAt: parseTimestamp(data.updatedAt || data.createdAt),
    updatedBy: data.updatedBy || '',
  };
}

function mapDocToCommitment(id: string, data: Record<string, any>): CommitmentItem {
  return {
    id,
    title: data.title || '',
    subtitle: data.subtitle || '',
    description: data.description || '',
    iconName: data.iconName || 'ShieldCheck',
    guarantee: data.guarantee || '',
    order: typeof data.order === 'number' ? data.order : 0,
    createdAt: parseTimestamp(data.createdAt),
    updatedAt: parseTimestamp(data.updatedAt || data.createdAt),
  };
}

let isSeedingCommitments = false;

export async function seedDefaultCommitmentsIfEmpty(): Promise<void> {
  if (isSeedingCommitments) return;
  const firebase = getFirebaseInstance();
  if (!firebase) return;

  try {
    isSeedingCommitments = true;
    const colRef = collection(firebase.db, COMMITMENTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.info('[Darex Commitments] Seeding engineering commitments into Firestore...');
      const now = new Date().toISOString();
      for (let i = 0; i < COMMITMENTS_DATA.length; i++) {
        const c = COMMITMENTS_DATA[i];
        const docRef = doc(firebase.db, COMMITMENTS_COLLECTION, c.id);
        await setDoc(docRef, {
          title: c.title,
          subtitle: c.subtitle,
          description: c.description,
          iconName: c.iconName,
          guarantee: c.guarantee,
          order: i + 1,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  } catch (err) {
    console.warn('[Darex Commitments] Auto-seed notice:', err);
  } finally {
    isSeedingCommitments = false;
  }
}

/**
 * Real-time listener for the Firestore `testimonials` collection using onSnapshot().
 * Synchronizes client reviews, approval state, and edits across all devices.
 */
export function subscribeToTestimonials(
  onUpdate: (testimonials: TestimonialItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    if (onError) onError(new Error('Firebase connection is not configured.'));
    onUpdate([]);
    return () => {};
  }

  try {
    const colRef = collection(firebase.db, TESTIMONIALS_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: TestimonialItem[] = snapshot.docs.map((d) =>
          mapDocToTestimonial(d.id, d.data())
        );
        onUpdate(list);
      },
      (err) => {
        console.error('[Darex Testimonials] Real-time listener error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[Darex Testimonials] Error starting listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for the Firestore `commitments` collection using onSnapshot().
 */
export function subscribeToCommitments(
  onUpdate: (commitments: CommitmentItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    onUpdate(COMMITMENTS_DATA);
    return () => {};
  }

  seedDefaultCommitmentsIfEmpty().catch(() => {});

  try {
    const colRef = collection(firebase.db, COMMITMENTS_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !isSeedingCommitments) {
          seedDefaultCommitmentsIfEmpty().catch(() => {});
        }
        const list: CommitmentItem[] = snapshot.docs.map((d) =>
          mapDocToCommitment(d.id, d.data())
        );
        onUpdate(list.length > 0 ? list : COMMITMENTS_DATA);
      },
      (err) => {
        console.error('[Darex Commitments] Real-time listener error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[Darex Commitments] Error starting listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Create a new client testimonial in Firestore.
 */
export async function createTestimonial(
  payload: Omit<TestimonialItem, 'id' | 'createdAt' | 'updatedAt'>,
  actorEmail?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  const trimmedName = payload.clientName?.trim();
  const trimmedQuote = payload.quote?.trim();

  if (!trimmedName || !trimmedQuote) {
    return { success: false, error: 'Client name and testimonial quote are required.' };
  }

  try {
    const customId = `testimonial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(firebase.db, TESTIMONIALS_COLLECTION, customId);
    const initials = trimmedName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'DX';

    const docData = sanitizePayload({
      clientName: trimmedName,
      clientRole: payload.clientRole?.trim() || 'Client',
      company: payload.company?.trim() || '',
      avatarText: payload.avatarText?.trim() || initials,
      quote: trimmedQuote,
      rating: typeof payload.rating === 'number' ? payload.rating : 5,
      projectDelivered: payload.projectDelivered?.trim() || 'Custom Software',
      published: payload.published !== false,
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
    console.error('[Darex Testimonials] Create error:', err);
    return { success: false, error: err?.message || 'Failed to save testimonial to Firestore.' };
  }
}

/**
 * Update an existing testimonial in Firestore.
 */
export async function updateTestimonial(
  id: string,
  updates: Partial<TestimonialItem>,
  actorEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    const docRef = doc(firebase.db, TESTIMONIALS_COLLECTION, id);
    const sanitized = sanitizePayload({
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
    console.error('[Darex Testimonials] Update error:', err);
    return { success: false, error: err?.message || 'Failed to update testimonial in Firestore.' };
  }
}

/**
 * Permanently delete a testimonial from Firestore.
 */
export async function deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    const docRef = doc(firebase.db, TESTIMONIALS_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    console.error('[Darex Testimonials] Delete error:', err);
    return { success: false, error: err?.message || 'Failed to delete testimonial from Firestore.' };
  }
}

/**
 * Toggle published / unpublished state of a testimonial in Firestore.
 */
export async function toggleTestimonialPublish(
  id: string,
  currentPublished: boolean,
  actorEmail?: string
): Promise<{ success: boolean; newPublished: boolean; error?: string }> {
  const newPublished = !currentPublished;
  const res = await updateTestimonial(id, { published: newPublished }, actorEmail);
  return { success: res.success, newPublished, error: res.error };
}
