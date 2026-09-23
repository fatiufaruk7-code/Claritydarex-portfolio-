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
import { PROJECTS_DATA } from '../data/projects';
import type { ProjectItem } from '../types';

export const PROJECTS_COLLECTION = 'projects';

function parseTimestamp(val: any): string {
  if (!val) return new Date().toISOString();
  if (val && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function sanitizeProjectPayload(data: Partial<ProjectItem>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function mapDocToProject(id: string, data: Record<string, any>): ProjectItem {
  return {
    id,
    title: data.title || 'Untitled Project',
    category: data.category || 'Corporate',
    shortDescription: data.shortDescription || '',
    fullDescription: data.fullDescription || data.shortDescription || '',
    image: data.image || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    liveUrl: data.liveUrl || '',
    client: data.client || 'Client Delivery',
    year: data.year || '2025',
    results: Array.isArray(data.results) ? data.results : [],
    status: (data.status as 'PUBLISHED' | 'DRAFT') || 'PUBLISHED',
    order: typeof data.order === 'number' ? data.order : 0,
    createdAt: parseTimestamp(data.createdAt),
    updatedAt: parseTimestamp(data.updatedAt || data.createdAt),
    updatedBy: data.updatedBy || '',
  };
}

let isSeedingProjects = false;

/**
 * Ensures initial default projects are physically stored in Firestore if the collection is empty.
 * This guarantees all devices immediately see synchronized project records.
 */
export async function seedDefaultProjectsIfEmpty(): Promise<void> {
  if (isSeedingProjects) return;
  const firebase = getFirebaseInstance();
  if (!firebase) return;

  try {
    isSeedingProjects = true;
    const colRef = collection(firebase.db, PROJECTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.info('[Darex Projects] Seeding default projects into Firestore...');
      const now = new Date().toISOString();
      for (let i = 0; i < PROJECTS_DATA.length; i++) {
        const p = PROJECTS_DATA[i];
        const docRef = doc(firebase.db, PROJECTS_COLLECTION, p.id);
        await setDoc(docRef, {
          title: p.title,
          category: p.category,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          image: p.image,
          technologies: p.technologies,
          liveUrl: p.liveUrl || '',
          client: p.client || 'Client Demonstration',
          year: p.year,
          results: p.results,
          status: 'PUBLISHED',
          order: i + 1,
          createdAt: now,
          updatedAt: now,
          updatedBy: 'System Bootstrap',
        });
      }
    }
  } catch (err) {
    console.warn('[Darex Projects] Auto-seed projects notice:', err);
  } finally {
    isSeedingProjects = false;
  }
}

/**
 * Real-time listener for the Firestore `projects` collection using onSnapshot().
 * Synchronizes case study edits, additions, and deletions across all devices in real time.
 */
export function subscribeToProjects(
  onUpdate: (projects: ProjectItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    if (onError) onError(new Error('Firebase connection is not configured.'));
    onUpdate(
      PROJECTS_DATA.map((p, idx) => ({
        ...p,
        status: 'PUBLISHED',
        order: idx + 1,
        createdAt: new Date().toISOString(),
      }))
    );
    return () => {};
  }

  seedDefaultProjectsIfEmpty().catch(() => {});

  try {
    const colRef = collection(firebase.db, PROJECTS_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !isSeedingProjects) {
          seedDefaultProjectsIfEmpty().then(() => {}).catch(() => {});
        }

        const list: ProjectItem[] = snapshot.docs.map((d) =>
          mapDocToProject(d.id, d.data())
        );

        onUpdate(list);
      },
      (err) => {
        console.error('[Darex Projects] Real-time listener error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[Darex Projects] Error starting listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Fetch all projects directly from Firestore once.
 */
export async function getProjects(): Promise<ProjectItem[]> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return PROJECTS_DATA.map((p, idx) => ({
      ...p,
      status: 'PUBLISHED',
      order: idx + 1,
      createdAt: new Date().toISOString(),
    }));
  }

  try {
    const colRef = collection(firebase.db, PROJECTS_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      await seedDefaultProjectsIfEmpty();
      const retrySnap = await getDocs(q);
      return retrySnap.docs.map((d) => mapDocToProject(d.id, d.data()));
    }
    return snap.docs.map((d) => mapDocToProject(d.id, d.data()));
  } catch (err) {
    console.warn('[Darex Projects] getProjects error:', err);
    return PROJECTS_DATA.map((p, idx) => ({
      ...p,
      status: 'PUBLISHED',
      order: idx + 1,
      createdAt: new Date().toISOString(),
    }));
  }
}

/**
 * Add a new project to Firestore.
 */
export async function createProject(
  payload: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>,
  actorEmail?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  const trimmedTitle = payload.title?.trim();
  if (!trimmedTitle) {
    return { success: false, error: 'Project title is required.' };
  }

  try {
    const customId = `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(firebase.db, PROJECTS_COLLECTION, customId);
    const docData = sanitizeProjectPayload({
      title: trimmedTitle,
      category: payload.category || 'Corporate',
      shortDescription: payload.shortDescription?.trim() || '',
      fullDescription: payload.fullDescription?.trim() || payload.shortDescription?.trim() || '',
      image: payload.image?.trim() || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      technologies: Array.isArray(payload.technologies) ? payload.technologies.filter(Boolean) : [],
      liveUrl: payload.liveUrl?.trim() || '',
      client: payload.client?.trim() || 'Client Deployment',
      year: payload.year?.trim() || new Date().getFullYear().toString(),
      results: Array.isArray(payload.results) ? payload.results.filter(Boolean) : [],
      status: payload.status || 'PUBLISHED',
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
    console.error('[Darex Projects] Create project error:', err);
    return { success: false, error: err?.message || 'Failed to save project to Firestore.' };
  }
}

/**
 * Update an existing project in Firestore.
 */
export async function updateProject(
  id: string,
  updates: Partial<ProjectItem>,
  actorEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    const docRef = doc(firebase.db, PROJECTS_COLLECTION, id);
    const sanitized = sanitizeProjectPayload({
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
    console.error('[Darex Projects] Update project error:', err);
    return { success: false, error: err?.message || 'Failed to update project in Firestore.' };
  }
}

/**
 * Permanently delete a project from Firestore.
 */
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  const firebase = getFirebaseInstance();
  if (!firebase) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    const docRef = doc(firebase.db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    console.error('[Darex Projects] Delete project error:', err);
    return { success: false, error: err?.message || 'Failed to delete project from Firestore.' };
  }
}

/**
 * Toggle published / draft status of a project in Firestore.
 */
export async function toggleProjectStatus(
  id: string,
  currentStatus: 'PUBLISHED' | 'DRAFT',
  actorEmail?: string
): Promise<{ success: boolean; newStatus: 'PUBLISHED' | 'DRAFT'; error?: string }> {
  const newStatus: 'PUBLISHED' | 'DRAFT' = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  const res = await updateProject(id, { status: newStatus }, actorEmail);
  return { success: res.success, newStatus, error: res.error };
}
