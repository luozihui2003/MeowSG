import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { getCatOnce, removeCat } from '../cats';
import { logFeed, useTodaysFeedings } from '../feedings';
import type { Cat } from '../types';

export function CatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const todaysFeeds = useTodaysFeedings();

  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedNote, setFeedNote] = useState('');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/cats');
      return;
    }
    void (async () => {
      const c = await getCatOnce(id);
      setCat(c);
      setLoading(false);
    })();
  }, [id, navigate]);

  const todaysForThis = cat ? todaysFeeds.filter((l) => l.catId === cat.id) : [];
  const canEdit = !!(user && cat && user.uid === cat.createdByUid);

  async function handleLogFeed() {
    if (!cat || !user) return;
    setLogging(true);
    try {
      await logFeed(cat.id, user, feedNote || undefined);
      setFeedNote('');
    } finally {
      setLogging(false);
    }
  }

  async function handleRemove() {
    if (!cat) return;
    if (!confirm(`Delete ${cat.name}? This cannot be undone.`)) return;
    await removeCat(cat.id);
    navigate('/cats');
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (!cat)
    return (
      <>
        <p>Cat not found.</p>
        <Link to="/cats" className="btn secondary">Back to list</Link>
      </>
    );

  return (
    <>
      <div className="header-row">
        <h2>{cat.name || '(unnamed)'}</h2>
        {canEdit && (
          <Link to={`/cats/${cat.id}/edit`} className="btn secondary">Edit</Link>
        )}
      </div>

      <div className="card">
        <div className="row">
          <span className="tag">{cat.color || 'Unknown color'}</span>
          <span className="tag">
            {cat.sex === 'male' ? '♂ Male' : cat.sex === 'female' ? '♀ Female' : 'Sex unsure'}
          </span>
          {cat.isNeutered ? (
            <span className="tag success">Neutered</span>
          ) : (
            <span className="tag warn">Not neutered</span>
          )}
        </div>

        {cat.areaDescription && (
          <p><strong>Area:</strong> {cat.areaDescription}</p>
        )}
        <p className="muted small">
          Location: {cat.location.lat.toFixed(5)}, {cat.location.lng.toFixed(5)}
        </p>

        {cat.personality && <p><strong>Personality:</strong> {cat.personality}</p>}
        {cat.watchOut && <p><strong>Watch out:</strong> {cat.watchOut}</p>}
        {cat.healthNotes && <p><strong>Health:</strong> {cat.healthNotes}</p>}
        {cat.preferredFoods && (
          <p><strong>Preferred foods:</strong> {cat.preferredFoods}</p>
        )}

        <p className="muted xs">Added by {cat.createdByName}</p>
      </div>

      <div className="card">
        <h3>Today's feedings</h3>
        {todaysForThis.length === 0 ? (
          <p className="muted">Not fed yet today.</p>
        ) : (
          <ul className="feeds">
            {todaysForThis.map((f) => (
              <li key={f.id}>
                <strong>{formatTime(f.fedAt)}</strong> — {f.feederName}
                {f.notes && <span className="muted"> — {f.notes}</span>}
              </li>
            ))}
          </ul>
        )}

        <div className="field">
          <label htmlFor="note">Add note (optional)</label>
          <input
            id="note"
            value={feedNote}
            onChange={(e) => setFeedNote(e.target.value)}
            placeholder="e.g. Ate well, looks healthy"
          />
        </div>
        <button
          className="btn"
          onClick={() => void handleLogFeed()}
          disabled={logging}
        >
          {logging ? 'Logging…' : '🍽️ I just fed this cat'}
        </button>
      </div>

      {canEdit && (
        <button className="btn danger" onClick={() => void handleRemove()}>
          Delete cat
        </button>
      )}
    </>
  );
}
