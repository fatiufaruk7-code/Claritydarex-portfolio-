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
import { getFirebaseInstance, checkFirebaseConfig } from '../firebase/config';
import type { ContactSubmission } from '../types';

const LOCAL_STORAGE_KEY = 'darex_contact_submissions_v2';

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
    createdAt: nowIso,
    source: 'local',
  };

  // Always save to resilient local database first
  const currentLocal = getLocalSubmissions();
  currentLocal.unshift(submissionRecord);
  saveLocalSubmissions(currentLocal);

  // Attempt to sync to Firestore if configured
  let savedFirestore = false;
  try {
    const firebase = getFirebaseInstance();
    if (firebase) {
      const docRef = await addDoc(collection(firebase.db, 'submissions'), {
        ...submissionRecord,
        source: 'firestore',
      });
      submissionRecord.id = docRef.id;
      submissionRecord.source = 'firestore';
      savedFirestore = true;
    }
  } catch (error) {
    console.info('Firestore cloud sync deferred (offline/unconfigured). Inquiries preserved safely in local records.', error);
  }

  return {
    success: true,
    id: submissionRecord.id || newId,
    savedLocally: true,
    savedFirestore,
  };
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const localList = getLocalSubmissions();
  let firestoreList: ContactSubmission[] = [];

  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      const q = query(collection(firebase.db, 'submissions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnapshot) => {
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
          createdAt: data.createdAt || new Date().toISOString(),
          source: 'firestore',
        });
      });
    } catch (err) {
      console.warn('Could not retrieve submissions from Firestore, falling back to local storage', err);
    }
  }

  // Merge and deduplicate by email + createdAt or id
  const combinedMap = new Map<string, ContactSubmission>();
  
  localList.forEach((item) => {
    combinedMap.set(item.id || `${item.email}_${item.createdAt}`, item);
  });
  
  firestoreList.forEach((item) => {
    combinedMap.set(item.id || `${item.email}_${item.createdAt}`, item);
  });

  const merged = Array.from(combinedMap.values())
    // Filter out any previous fake demo entries
    .filter((item) => !item.id?.startsWith('sub_demo_'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return merged;
}

export async function toggleSubmissionRead(id: string, currentReadStatus: boolean): Promise<void> {
  // Update in local storage
  const local = getLocalSubmissions();
  const updatedLocal = local.map((item) =>
    item.id === id ? { ...item, read: !currentReadStatus } : item
  );
  saveLocalSubmissions(updatedLocal);

  // Update in Firestore if available
  const firebase = getFirebaseInstance();
  if (firebase) {
    try {
      const docRef = doc(firebase.db, 'submissions', id);
      await updateDoc(docRef, { read: !currentReadStatus });
    } catch (e) {
      console.warn('Could not update Firestore read status', e);
    }
  }
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
      const docRef = doc(firebase.db, 'submissions', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Could not delete from Firestore', e);
    }
  }
}
