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
import { handleFirestoreError, OperationType } from '../firebase/errors';
import type { ContactSubmission } from '../types';

export async function submitContactForm(
  payload: Omit<ContactSubmission, 'id' | 'read' | 'createdAt'>
): Promise<{ success: boolean; id?: string }> {
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

  if (!trimmedMessage || trimmedMessage.length < 10) {
    throw new Error('Please provide project details or message (minimum 10 characters).');
  }

  // 2. Firebase check
  const firebase = getFirebaseInstance();
  if (!firebase) {
    const { missingKeys } = checkFirebaseConfig();
    throw new Error(
      `Firebase is not yet configured. Missing environment variables: ${missingKeys.join(', ')}. ` +
      `Please add these variables to your .env file or Vercel project settings.`
    );
  }

  const submissionData: Omit<ContactSubmission, 'id'> = {
    name: trimmedName,
    email: trimmedEmail,
    phone: payload.phone?.trim() || '',
    company: payload.company?.trim() || '',
    projectType: payload.projectType || 'General Inquiry',
    message: trimmedMessage,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(firebase.db, 'submissions'), submissionData);
    return { success: true, id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'submissions');
  }
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    const { missingKeys } = checkFirebaseConfig();
    throw new Error(
      `Firebase is not yet configured. Missing: ${missingKeys.join(', ')}`
    );
  }

  try {
    const q = query(
      collection(firebase.db, 'submissions'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const submissions: ContactSubmission[] = [];

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      submissions.push({
        id: docSnapshot.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        projectType: data.projectType || 'General Inquiry',
        message: data.message || '',
        read: Boolean(data.read),
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });

    return submissions;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'submissions');
  }
}

export async function toggleSubmissionRead(id: string, currentReadStatus: boolean): Promise<void> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    throw new Error('Firebase instance unavailable.');
  }

  try {
    const docRef = doc(firebase.db, 'submissions', id);
    await updateDoc(docRef, { read: !currentReadStatus });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
  }
}

export async function deleteSubmissionRecord(id: string): Promise<void> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    throw new Error('Firebase instance unavailable.');
  }

  try {
    const docRef = doc(firebase.db, 'submissions', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `submissions/${id}`);
  }
}
