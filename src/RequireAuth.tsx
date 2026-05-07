import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
