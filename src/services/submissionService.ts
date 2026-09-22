import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/config';
import type {
  ContactSubmission,
  EnquiryStatus,
  InternalNote,
  EnquiryActivity,
  StaffMember,
} from '../types';

const LOCAL_STORAGE_KEY = 'darex_contact_submissions_v2';
const PRIMARY_COLLECTION = 'contactSubmissions';
const LEGACY_COLLECTION = 'submissions';

// Helper to get local submissions
function getLocalSubmissions(): ContactSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper to save local submissions
function saveLocalSubmissions(list: ContactSubmission[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save submissions to local storage', e);
  }
}

export async function submitContactForm(
  payload: Omit<ContactSubmission, 'id' | 'read' | 'createdAt'>
): Promise<{ success: boolean; id: string; savedLocally?: boolean; savedFirestore?: boolean }> {
  // 1. Validation
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

  const newId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const nowIso = new Date().toISOString();

  const initialActivity: EnquiryActivity = {
    id: `act_${Date.now()}_1`,
    action: 'Enquiry Created',
    user: trimmedName,
    role: 'Client',
    timestamp: nowIso,
    details: `Inquiry submitted for ${payload.projectType || 'Website Development'}`,
  };

  const submissionRecord: ContactSubmission = {
    id: newId,
    name: trimmedName,
    email: trimmedEmail,
    phone: payload.phone?.trim() || '',
    company: payload.company?.trim() || '',
    projectType: payload.projectType || 'Website Development',
    budget: payload.budget || 'Flexible / Discussion',
    timeline: payload.timeline || 'Standard (3-4 weeks)',
    message: trimmedMessage,
    read: false,
    status: 'NEW',
    internalNotes: [],
    activityHistory: [initialActivity],
    createdAt: nowIso,
    updatedAt: nowIso,
    source: 'local',
  };

  // Always save to resilient local database first
  const currentLocal = getLocalSubmissions();
  currentLocal.unshift(submissionRecord);
  saveLocalSubmissions(currentLocal);

  // Attempt to sync to Firestore `contactSubmissions` collection
  let savedFirestore = false;
  try {
    const firebase = getFirebaseInstance();
    if (firebase) {
      const docRef = await addDoc(collection(firebase.db, PRIMARY_COLLECTION), {
        ...submissionRecord,
        source: 'firestore',
      });
      submissionRecord.id = docRef.id;
      submissionRecord.source = 'firestore';
      savedFirestore = true;
    }
  } catch (error) {
    console.info(
      'Firestore cloud sync deferred (offline/unconfigured). Inquiries preserved safely in local records.',
      error
    );
  }

  return {
    success: true,
    id: submissionRecord.id || newId,
    savedLocally: true,
    savedFirestore,
  };
}

/**
 * Retrieve submissions from both contactSubmissions (primary) and legacy submissions collection,
 * merged cleanly with local storage.
 */
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const localList = getLocalSubmissions();
  let firestoreList: ContactSubmission[] = [];

  const firebase = getFirebaseInstance();
  if (firebase) {
    // 1. Fetch from contactSubmissions
    try {
      const qPrimary = query(collection(firebase.db, PRIMARY_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshotPrimary = await getDocs(qPrimary);
      snapshotPrimary.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        firestoreList.push({
          id: docSnapshot.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          projectType: data.projectType || 'Website Development',
          budget: data.budget || 'Flexible',
          timeline: data.timeline || 'Standard',
          message: data.message || '',
          read: Boolean(data.read),
          status: (data.status as EnquiryStatus) || (data.read ? 'RESOLVED' : 'NEW'),
          assignedStaffId: data.assignedStaffId,
          assignedStaffName: data.assignedStaffName,
          assignedStaffEmail: data.assignedStaffEmail,
          assignedStaffRole: data.assignedStaffRole,
          internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
          activityHistory: Array.isArray(data.activityHistory) ? data.activityHistory : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
          source: 'firestore',
        });
      });
    } catch (err) {
      console.warn('Could not retrieve from contactSubmissions, checking legacy collection:', err);
    }

    // 2. Also check legacy `submissions` collection to ensure no past records are lost
    try {
      const qLegacy = query(collection(firebase.db, LEGACY_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshotLegacy = await getDocs(qLegacy);
      snapshotLegacy.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // Only add if not already in firestoreList
        if (!firestoreList.some((s) => s.id === docSnapshot.id)) {
          firestoreList.push({
            id: docSnapshot.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || '',
            projectType: data.projectType || 'Website Development',
            budget: data.budget || 'Flexible',
            timeline: data.timeline || 'Standard',
            message: data.message || '',
            read: Boolean(data.read),
            status: (data.status as EnquiryStatus) || (data.read ? 'RESOLVED' : 'NEW'),
            assignedStaffId: data.assignedStaffId,
            assignedStaffName: data.assignedStaffName,
            assignedStaffEmail: data.assignedStaffEmail,
            assignedStaffRole: data.assignedStaffRole,
            internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
            activityHistory: Array.isArray(data.activityHistory) ? data.activityHistory : [],
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
            source: 'firestore',
          });
        }
      });
    } catch (err) {
      // Legacy collection empty or unavailable
    }
  }

  // Merge and deduplicate
  const combinedMap = new Map<string, ContactSubmission>();

  localList.forEach((item) => {
    combinedMap.set(item.id || `${item.email}_${item.createdAt}`, {
      status: 'NEW',
      internalNotes: [],
      activityHistory: [],
      ...item,
    });
  });

  firestoreList.forEach((item) => {
    combinedMap.set(item.id || `${item.email}_${item.createdAt}`, item);
  });

  const merged = Array.from(combinedMap.values())
    .filter((item) => !item.id?.startsWith('sub_demo_'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return merged;
}

/**
 * Assign or reassign an enquiry to a staff member.
 */
export async function assignEnquiry(
  id: string,
  staff: StaffMember,
  actor: { name: string; email: string; role: string }
): Promise<ContactSubmission> {
  const now = new Date().toISOString();
  const activity: EnquiryActivity = {
    id: `act_${Date.now()}`,
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
    updatedAt: now,
  };

  return updateSubmissionFields(id, updates, activity);
}

/**
 * Update the status of an enquiry (e.g. NEW -> IN_PROGRESS -> RESOLVED -> CLOSED).
 */
export async function updateEnquiryStatus(
  id: string,
  newStatus: EnquiryStatus,
  actor: { name: string; email: string; role: string },
  noteReason?: string
): Promise<ContactSubmission> {
  const now = new Date().toISOString();
  const activity: EnquiryActivity = {
    id: `act_${Date.now()}`,
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
    updatedAt: now,
  };

  return updateSubmissionFields(id, updates, activity);
}

/**
 * Add an internal note to an enquiry.
 */
export async function addInternalNote(
  id: string,
  noteText: string,
  actor: { name: string; email: string; role: string }
): Promise<ContactSubmission> {
  const trimmed = noteText.trim();
  if (!trimmed) throw new Error('Note content cannot be empty.');

  const now = new Date().toISOString();
  const newNote: InternalNote = {
    id: `note_${Date.now()}`,
    authorName: actor.name,
    authorEmail: actor.email,
    authorRole: actor.role,
    text: trimmed,
    createdAt: now,
  };

  const activity: EnquiryActivity = {
    id: `act_${Date.now()}`,
    action: 'Internal Note Added',
    user: actor.name,
    role: actor.role,
    timestamp: now,
    details: trimmed.length > 60 ? `${trimmed.substring(0, 60)}...` : trimmed,
  };

  // Fetch current submission to append note
  const list = getLocalSubmissions();
  const existing = list.find((s) => s.id === id);
  const currentNotes = existing?.internalNotes || [];
  const updatedNotes = [...currentNotes, newNote];

  return updateSubmissionFields(
    id,
    {
      internalNotes: updatedNotes,
      updatedAt: now,
    },
    activity
  );
}

/**
 * Helper to update fields on a submission locally and across Firestore.
 */
async function updateSubmissionFields(
  id: string,
  updates: Partial<ContactSubmission>,
  newActivity?: EnquiryActivity
): Promise<ContactSubmission> {
  const local = getLocalSubmissions();
  let updatedRecord: ContactSubmission | null = null;

  const updatedLocal = local.map((item) => {
    if (item.id === id) {
      const mergedActivities = newActivity
        ? [...(item.activityHistory || []), newActivity]
        : item.activityHistory || [];

      updatedRecord = {
        ...item,
        ...updates,
        activityHistory: mergedActivities,
      };
      return updatedRecord;
    }
    return item;
  });

  if (updatedRecord) {
    saveLocalSubmissions(updatedLocal);
  }

  // Attempt Firestore update
  const firebase = getFirebaseInstance();
  if (firebase) {
    const firestoreUpdates: any = { ...updates };
    if (newActivity && updatedRecord) {
      firestoreUpdates.activityHistory = (updatedRecord as ContactSubmission).activityHistory;
    }

    try {
      // Try primary collection first
      const docRefPrimary = doc(firebase.db, PRIMARY_COLLECTION, id);
      await updateDoc(docRefPrimary, firestoreUpdates);
    } catch (e) {
      try {
        // Fallback to legacy collection if it was stored there
        const docRefLegacy = doc(firebase.db, LEGACY_COLLECTION, id);
        await updateDoc(docRefLegacy, firestoreUpdates);
      } catch (err2) {
        console.warn('Could not update Firestore document for enquiry:', id, err2);
      }
    }
  }

  if (!updatedRecord) {
    throw new Error('Enquiry not found.');
  }

  return updatedRecord;
}

export async function toggleSubmissionRead(id: string, currentReadStatus: boolean): Promise<void> {
  const newRead = !currentReadStatus;
  await updateSubmissionFields(id, {
    read: newRead,
    status: newRead ? 'IN_PROGRESS' : 'NEW',
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteSubmissionRecord(id: string): Promise<void> {
  // Remove from local storage
  const local = getLocalSubmissions();
  const filtered = local.filter((item) => item.id !== id);
  saveLocalSubmissions(filtered);

  // Remove from Firestore if available
  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      await deleteDoc(doc(firebase.db, PRIMARY_COLLECTION, id));
    } catch (e) {
      try {
        await deleteDoc(doc(firebase.db, LEGACY_COLLECTION, id));
      } catch (err) {
        console.warn('Could not delete from Firestore', err);
      }
    }
  }
}
