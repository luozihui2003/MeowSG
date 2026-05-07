import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export function LoginPage() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate('/cats', { replace: true });
  }, [user, navigate]);

  async function signIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="hero">
        <div className="paw">🐾</div>
        <h1>MeowSG</h1>
        <p className="tagline">Community cat feeders, working together.</p>
      </div>
      <button className="btn" onClick={() => void signIn()} disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {error && <p className="err">{error}</p>}
      <p className="muted small">
        Sign in to share locations of stray cats, log feedings, and avoid duplicate
        feeds with other feeders in Singapore.
      </p>
    </div>
  );
}
