import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { AppUser, Cat, CatDraft, CatSex } from './types';

const COLLECTION = 'cats';

function snapToCat(id: string, data: Record<string, unknown>): Cat {
  return {
    id,
    name: (data['name'] as string) ?? '',
    photoUrl: data['photoUrl'] as string | undefined,
    color: (data['color'] as string) ?? '',
    sex: ((data['sex'] as CatSex) ?? 'unsure'),
    isNeutered: Boolean(data['isNeutered']),
    personality: data['personality'] as string | undefined,
    healthNotes: data['healthNotes'] as string | undefined,
    watchOut: data['watchOut'] as string | undefined,
    preferredFoods: data['preferredFoods'] as string | undefined,
    location: (data['location'] as { lat: number; lng: number }) ?? { lat: 0, lng: 0 },
    areaDescription: data['areaDescription'] as string | undefined,
    createdByUid: (data['createdByUid'] as string) ?? '',
    createdByName: (data['createdByName'] as string) ?? '',
    createdAt: (data['createdAt'] as number) ?? Date.now(),
    updatedAt: (data['updatedAt'] as number) ?? Date.now(),
  };
}

let cachedCats: Cat[] = [];
const listeners = new Set<(c: Cat[]) => void>();
let subscribed = false;

function ensureSubscription(): void {
  if (subscribed) return;
  subscribed = true;
  const q = query(collection(firestore(), COLLECTION), orderBy('name'));
  onSnapshot(q, (snap) => {
    const list: Cat[] = [];
    snap.forEach((d) => list.push(snapToCat(d.id, d.data())));
    cachedCats = list;
    listeners.forEach((cb) => cb(list));
  });
}

export function useCats(): Cat[] {
  const [cats, setCats] = useState<Cat[]>(cachedCats);
  useEffect(() => {
    ensureSubscription();
    listeners.add(setCats);
    setCats(cachedCats);
    return () => {
      listeners.delete(setCats);
    };
  }, []);
  return cats;
}

export async function getCatOnce(id: string): Promise<Cat | null> {
  const ref = doc(firestore(), COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snapToCat(snap.id, snap.data());
}

export async function createCat(draft: CatDraft, user: AppUser): Promise<string> {
  const ref = await addDoc(collection(firestore(), COLLECTION), {
    ...draft,
    createdByUid: user.uid,
    createdByName: user.displayName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdAtServer: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCat(id: string, patch: Partial<CatDraft>): Promise<void> {
  await updateDoc(doc(firestore(), COLLECTION, id), {
    ...patch,
    updatedAt: Date.now(),
  });
}

export async function removeCat(id: string): Promise<void> {
  await deleteDoc(doc(firestore(), COLLECTION, id));
}
