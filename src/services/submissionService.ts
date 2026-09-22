import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/config';
import type {
  ContactSubmission,
  EnquiryStatus,
  InternalNote,
  EnquiryActivity,
  StaffMember,
} from '../types';

export const PRIMARY_COLLECTION = 'contactSubmissions';

/**
 * Parses timestamp from Firestore (Timestamp object, ISO string, or fallback to current time)
 */
function parseTimestamp(val: any): string {
  if (!val) return new Date().toISOString();
  if (val && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

/**
 * Maps a Firestore document snapshot to the ContactSubmission interface
 */
function mapDocToSubmission(id: string, data: Record<string, any>): ContactSubmission {
  const createdAtIso = parseTimestamp(data.createdAt);
  const updatedAtIso = parseTimestamp(data.updatedAt || data.createdAt);

  return {
    id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    projectType: data.projectType || data.subject || 'Website Development',
    budget: data.budget || 'Flexible / Discussion',
    timeline: data.timeline || 'Standard (3-4 weeks)',
    message: data.message || '',
    read: Boolean(data.read),
    status: (data.status as EnquiryStatus) || (data.read ? 'RESOLVED' : 'NEW'),
    assignedStaffId: data.assignedStaffId || data.assignedTo || undefined,
    assignedStaffName: data.assignedStaffName || undefined,
    assignedStaffEmail: data.assignedStaffEmail || undefined,
    assignedStaffRole: data.assignedStaffRole || undefined,
    internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
    activityHistory: Array.isArray(data.activityHistory) ? data.activityHistory : [],
    createdAt: createdAtIso,
    updatedAt: updatedAtIso,
    source: 'firestore',
  };
}

/**
 * Submits a contact form enquiry directly to Firestore `contactSubmissions` collection.
 * Uses serverTimestamp() for accurate multi-device synchronization.
 */
export async function submitContactForm(
  payload: Omit<ContactSubmission, 'id' | 'read' | 'createdAt'>
): Promise<{ success: boolean; id: string; savedFirestore: boolean }> {
  // 1. Client-side field validation
  const trimmedName = payload.name?.trim();
  const trimmedEmail = payload.email?.trim();
  const trimmedMessage = payload.message?.trim();

  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('Please enter your full name (minimum 2 characters).');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  if (!trimmedMessage || trimmedMessage.length < 8) {
    throw new Error('Please provide a short description of your project (minimum 8 characters).');
  }

  // 2. Validate Firebase instance
  const firebase = getFirebaseInstance();
  if (!firebase) {
    throw new Error(
      'Firebase connection is unavailable. Please ensure Firebase environment configuration is present.'
    );
  }

  const initialActivity: EnquiryActivity = {
    id: `act_${Date.now()}_1`,
    action: 'Enquiry Created',
    user: trimmedName,
    role: 'Client',
    timestamp: new Date().toISOString(),
    details: `Inquiry submitted for ${payload.projectType || 'Website Development'}`,
  };

  // 3. Document structure in Firestore `contactSubmissions`
  const submissionDoc = {
    name: trimmedName,
    email: trimmedEmail,
    phone: payload.phone?.trim() || '',
    subject: payload.projectType || 'Website Development',
    company: payload.company?.trim() || '',
    projectType: payload.projectType || 'Website Development',
    budget: payload.budget || 'Flexible / Discussion',
    timeline: payload.timeline || 'Standard (3-4 weeks)',
    message: trimmedMessage,
    status: 'NEW',
    read: false,
    assignedTo: null,
    assignedStaffId: null,
    assignedStaffName: null,
    assignedStaffEmail: null,
    assignedStaffRole: null,
    internalNotes: [],
    activityHistory: [initialActivity],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    source: 'firestore',
  };

  try {
    const docRef = await addDoc(collection(firebase.db, PRIMARY_COLLECTION), submissionDoc);
    return {
      success: true,
      id: docRef.id,
      savedFirestore: true,
    };
  } catch (error: any) {
    console.error('[Darex Contact] Firestore submission error:', error);
    if (error?.code === 'permission-denied' || error?.message?.includes('PERMISSION_DENIED')) {
      throw new Error(
        'Submission failed: Firestore Cloud API or permissions issue. Ensure Cloud Firestore is enabled in Google Cloud / Firebase Console.'
      );
    }
    throw new Error(error?.message || 'Failed to submit contact enquiry to Firestore.');
  }
}

/**
 * Subscribes to the `contactSubmissions` collection in real time using onSnapshot.
 * Unsubscribes cleanly when invoked by component cleanup.
 */
export function subscribeToContactSubmissions(
  callback: (submissions: ContactSubmission[]) => void,
  onError?: (error: Error) => void
): () => void {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    if (onError) onError(new Error('Firebase is not configured.'));
    return () => {};
  }

  try {
    const q = query(
      collection(firebase.db, PRIMARY_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const submissions: ContactSubmission[] = snapshot.docs.map((docSnap) =>
          mapDocToSubmission(docSnap.id, docSnap.data())
        );

        // Ensure proper chronological sort even during latency compensation for serverTimestamp
        submissions.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        callback(submissions);
      },
      (err) => {
        console.error('[Darex Submissions] Real-time onSnapshot listener error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[Darex Submissions] Error initiating real-time listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Retrieve submissions directly from Firestore `contactSubmissions` collection.
 */
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    throw new Error('Firebase is not configured.');
  }

  const q = query(
    collection(firebase.db, PRIMARY_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const submissions: ContactSubmission[] = snapshot.docs.map((docSnap) =>
    mapDocToSubmission(docSnap.id, docSnap.data())
  );

  submissions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return submissions;
}

/**
 * Assign or reassign an enquiry to a staff member in Firestore.
 */
export async function assignEnquiry(
  id: string,
  staff: StaffMember,
  actor: { name: string; email: string; role: string }
): Promise<ContactSubmission> {
  const now = new Date().toISOString();
  const activity: EnquiryActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action: 'Enquiry Assigned',
    user: actor.name,
    role: actor.role,
    timestamp: now,
    details: `Assigned to ${staff.fullName} (${staff.role})`,
  };

  const updates: Partial<ContactSubmission> = {
    assignedStaffId: staff.id,
    assignedStaffName: staff.fullName,
    assignedStaffEmail: staff.email,
    assignedStaffRole: staff.role,
    status: 'ASSIGNED',
  };

  return updateSubmissionFields(id, updates, activity);
}

/**
 * Update the status of an enquiry (e.g. NEW -> IN_PROGRESS -> RESOLVED -> CLOSED) in Firestore.
 */
export async function updateEnquiryStatus(
  id: string,
  newStatus: EnquiryStatus,
  actor: { name: string; email: string; role: string },
  noteReason?: string
): Promise<ContactSubmission> {
  const now = new Date().toISOString();
  const activity: EnquiryActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action:
      newStatus === 'RESOLVED'
        ? 'Enquiry Resolved'
        : newStatus === 'CLOSED'
        ? 'Enquiry Closed'
        : 'Status Changed',
    user: actor.name,
    role: actor.role,
    timestamp: now,
    details: noteReason
      ? `Status changed to ${newStatus}. Note: ${noteReason}`
      : `Status changed to ${newStatus}`,
  };

  const updates: Partial<ContactSubmission> = {
    status: newStatus,
    read: newStatus !== 'NEW',
  };

  return updateSubmissionFields(id, updates, activity);
}

/**
 * Add an internal note to an enquiry in Firestore.
 */
export async function addInternalNote(
  id: string,
  noteText: string,
  actor: { name: string; email: string; role: string }
): Promise<ContactSubmission> {
  const trimmed = noteText.trim();
  if (!trimmed) throw new Error('Note content cannot be empty.');

  const firebase = getFirebaseInstance();
  if (!firebase) throw new Error('Firebase Firestore is not initialized.');

  const docRef = doc(firebase.db, PRIMARY_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Enquiry document not found in Firestore.');
  }

  const currentData = docSnap.data();
  const currentNotes: InternalNote[] = Array.isArray(currentData.internalNotes)
    ? currentData.internalNotes
    : [];

  const now = new Date().toISOString();
  const newNote: InternalNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    authorName: actor.name,
    authorEmail: actor.email,
    authorRole: actor.role,
    text: trimmed,
    createdAt: now,
  };

  const updatedNotes = [...currentNotes, newNote];

  const activity: EnquiryActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action: 'Internal Note Added',
    user: actor.name,
    role: actor.role,
    timestamp: now,
    details: trimmed.length > 60 ? `${trimmed.substring(0, 60)}...` : trimmed,
  };

  return updateSubmissionFields(
    id,
    {
      internalNotes: updatedNotes,
    },
    activity
  );
}

/**
 * Directly updates fields on a Firestore submission document.
 */
export async function updateSubmissionFields(
  id: string,
  updates: Partial<ContactSubmission>,
  newActivity?: EnquiryActivity
): Promise<ContactSubmission> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    throw new Error('Firebase Firestore is not initialized.');
  }

  const docRef = doc(firebase.db, PRIMARY_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Enquiry document not found in Firestore.');
  }

  const currentData = docSnap.data();
  const currentActivities: EnquiryActivity[] = Array.isArray(currentData.activityHistory)
    ? currentData.activityHistory
    : [];
  const mergedActivities = newActivity
    ? [...currentActivities, newActivity]
    : currentActivities;

  const firestoreUpdates: Record<string, any> = {
    ...updates,
    activityHistory: mergedActivities,
    updatedAt: serverTimestamp(),
  };

  // Synchronize assignedTo / assignedStaffName
  if (updates.assignedStaffId !== undefined) {
    firestoreUpdates.assignedTo = updates.assignedStaffId || null;
  }
  if (updates.assignedStaffName !== undefined) {
    firestoreUpdates.assignedStaffName = updates.assignedStaffName || null;
  }

  await updateDoc(docRef, firestoreUpdates);

  return mapDocToSubmission(docSnap.id, {
    ...currentData,
    ...updates,
    activityHistory: mergedActivities,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Toggle read state of an enquiry in Firestore.
 */
export async function toggleSubmissionRead(id: string, currentReadStatus: boolean): Promise<void> {
  const newRead = !currentReadStatus;
  await updateSubmissionFields(id, {
    read: newRead,
    status: newRead ? 'IN_PROGRESS' : 'NEW',
  });
}

/**
 * Permanently delete a submission document from Firestore.
 */
export async function deleteSubmissionRecord(id: string): Promise<void> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    throw new Error('Firebase Firestore is not initialized.');
  }
  await deleteDoc(doc(firebase.db, PRIMARY_COLLECTION, id));
}

