import { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firestore } from './firebase';
import type { AppUser, FeedingLog } from './types';

const COLLECTION = 'feedings';

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function snapToLog(id: string, data: Record<string, unknown>): FeedingLog {
  return {
    id,
    catId: data['catId'] as string,
    feederUid: data['feederUid'] as string,
    feederName: data['feederName'] as string,
    fedAt: data['fedAt'] as number,
    notes: data['notes'] as string | undefined,
  };
}

let cachedLogs: FeedingLog[] = [];
const listeners = new Set<(l: FeedingLog[]) => void>();
let subscribed = false;

function ensureSubscription(): void {
  if (subscribed) return;
  subscribed = true;
  const q = query(
    collection(firestore(), COLLECTION),
    where('fedAt', '>=', startOfTodayMs()),
    orderBy('fedAt', 'desc'),
  );
  onSnapshot(q, (snap) => {
    const list: FeedingLog[] = [];
    snap.forEach((d) => list.push(snapToLog(d.id, d.data())));
    cachedLogs = list;
    listeners.forEach((cb) => cb(list));
  });
}

export function useTodaysFeedings(): FeedingLog[] {
  const [logs, setLogs] = useState<FeedingLog[]>(cachedLogs);
  useEffect(() => {
    ensureSubscription();
    listeners.add(setLogs);
    setLogs(cachedLogs);
    return () => {
      listeners.delete(setLogs);
    };
  }, []);
  return logs;
}

export async function logFeed(catId: string, user: AppUser, notes?: string): Promise<void> {
  await addDoc(collection(firestore(), COLLECTION), {
    catId,
    feederUid: user.uid,
    feederName: user.displayName,
    fedAt: Date.now(),
    notes: notes ?? '',
  });
}
