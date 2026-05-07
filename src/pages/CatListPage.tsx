import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCats } from '../cats';
import { useTodaysFeedings } from '../feedings';

export function CatListPage() {
  const allCats = useCats();
  const todaysFeeds = useTodaysFeedings();
  const [search, setSearch] = useState('');

  const cats = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allCats;
    return allCats.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.color.toLowerCase().includes(term) ||
        (c.areaDescription ?? '').toLowerCase().includes(term),
    );
  }, [search, allCats]);

  function fedToday(catId: string): { count: number; lastFeederName?: string } {
    const logs = todaysFeeds.filter((l) => l.catId === catId);
    return { count: logs.length, lastFeederName: logs[0]?.feederName };
  }

  return (
    <>
      <div className="header-row">
        <h2>Cats</h2>
        <Link to="/cats/new" className="btn">+ Add cat</Link>
      </div>

      <input
        type="search"
        placeholder="Search by name, color, area…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />

      {cats.length === 0 ? (
        <p className="muted center">No cats yet. Be the first to add one.</p>
      ) : (
        cats.map((cat) => {
          const fed = fedToday(cat.id);
          return (
            <Link key={cat.id} className="card cat-card" to={`/cats/${cat.id}`}>
              <div className="cat-info">
                <div className="row name-row">
                  <strong>{cat.name || '(unnamed)'}</strong>
                  {cat.isNeutered && <span className="tag">Neutered</span>}
                </div>
                <div className="muted small">
                  {cat.color} · {cat.areaDescription || '—'}
                </div>
              </div>
              <div className="fed-pill">
                {fed.count > 0 ? (
                  <>
                    <span className="tag success">Fed today</span>
                    <div className="muted xs">by {fed.lastFeederName}</div>
                  </>
                ) : (
                  <span className="tag warn">Not fed</span>
                )}
              </div>
            </Link>
          );
        })
      )}
    </>
  );
}
