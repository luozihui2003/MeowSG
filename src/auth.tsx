import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from './firebase';
import type { AppUser } from './types';

function toAppUser(u: User | null): AppUser | null {
  if (!u) return null;
  return {
    uid: u.uid,
    displayName: u.displayName ?? u.email ?? 'Anonymous Feeder',
    email: u.email,
    photoUrl: u.photoURL,
  };
}

interface AuthValue {
  user: AppUser | null;
  ready: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth(), (u) => {
      setUser(toAppUser(u));
      setReady(true);
    });
    return unsub;
  }, []);

  const value: AuthValue = {
    user,
    ready,
    signInWithGoogle: async () => {
      await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
    },
    signOut: async () => {
      await fbSignOut(firebaseAuth());
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
