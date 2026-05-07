import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { createCat, getCatOnce, updateCat } from '../cats';
import type { CatDraft, CatSex } from '../types';

const SG_CENTER = { lat: 1.3521, lng: 103.8198 };

interface AddressSuggestion {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
}

export function CatEditPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [sex, setSex] = useState<CatSex>('unsure');
  const [isNeutered, setIsNeutered] = useState(false);
  const [personality, setPersonality] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [watchOut, setWatchOut] = useState('');
  const [preferredFoods, setPreferredFoods] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [lat, setLat] = useState(SG_CENTER.lat);
  const [lng, setLng] = useState(SG_CENTER.lng);

  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const title = useMemo(() => (editingId ? 'Edit cat' : 'New cat'), [editingId]);

  useEffect(() => {
    if (!routeId) return;
    setEditingId(routeId);
    setLoading(true);
    void (async () => {
      const c = await getCatOnce(routeId);
      if (c) {
        setName(c.name);
        setColor(c.color);
        setSex(c.sex);
        setIsNeutered(c.isNeutered);
        setPersonality(c.personality ?? '');
        setHealthNotes(c.healthNotes ?? '');
        setWatchOut(c.watchOut ?? '');
        setPreferredFoods(c.preferredFoods ?? '');
        setAreaDescription(c.areaDescription ?? '');
        setLat(c.location.lat);
        setLng(c.location.lng);
      }
      setLoading(false);
    })();
  }, [routeId]);

  useEffect(() => {
    const q = addressQuery.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    const ctrl = new AbortController();
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const url =
          'https://nominatim.openstreetmap.org/search' +
          `?format=json&countrycodes=sg&limit=6&addressdetails=0&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { 'Accept-Language': 'en' },
        });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const raw = (await res.json()) as Array<{
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
        }>;
        setSuggestions(
          raw.map((r) => ({
            placeId: String(r.place_id),
            label: r.display_name,
            lat: Number(r.lat),
            lng: Number(r.lon),
          })),
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [addressQuery]);

  function selectSuggestion(s: AddressSuggestion) {
    setLat(s.lat);
    setLng(s.lng);
    setAddressQuery(s.label);
    if (!areaDescription.trim()) setAreaDescription(s.label);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation not supported on this device.');
      return;
    }
    setGeoBusy(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoBusy(false);
      },
      (err) => {
        setGeoError(err.message || 'Could not get location');
        setGeoBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setSaving(true);
    const draft: CatDraft = {
      name: name.trim(),
      color: color.trim(),
      sex,
      isNeutered,
      personality: personality.trim() || undefined,
      healthNotes: healthNotes.trim() || undefined,
      watchOut: watchOut.trim() || undefined,
      preferredFoods: preferredFoods.trim() || undefined,
      areaDescription: areaDescription.trim() || undefined,
      location: { lat, lng },
    };
    try {
      if (editingId) {
        await updateCat(editingId, draft);
        navigate(`/cats/${editingId}`);
      } else {
        const newId = await createCat(draft, user);
        navigate(`/cats/${newId}`);
      }
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    navigate(editingId ? `/cats/${editingId}` : '/cats');
  }

  return (
    <>
      <h2>{title}</h2>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="color">Color / markings</label>
            <input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Orange tabby with white socks"
            />
          </div>

          <div className="field">
            <label htmlFor="sex">Sex</label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as CatSex)}
            >
              <option value="unsure">Unsure</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="field check">
            <label>
              <input
                type="checkbox"
                checked={isNeutered}
                onChange={(e) => setIsNeutered(e.target.checked)}
              />
              Neutered
            </label>
          </div>

          <div className="field">
            <label htmlFor="area">Area description</label>
            <input
              id="area"
              value={areaDescription}
              onChange={(e) => setAreaDescription(e.target.value)}
              placeholder="e.g. Behind Block 234, near bin centre"
            />
          </div>

          <div className="field addr-field">
            <label htmlFor="address">Search address</label>
            <input
              id="address"
              type="text"
              autoComplete="off"
              value={addressQuery}
              onChange={(e) => {
                setAddressQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. 234 Bishan St 22 or Marina Bay"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="addr-suggest">
                {suggestions.map((s) => (
                  <li key={s.placeId}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(s)}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searching && addressQuery.trim().length >= 3 && (
              <p className="muted xs">Searching…</p>
            )}

            <button
              type="button"
              className="btn secondary geo-btn"
              onClick={useMyLocation}
              disabled={geoBusy}
            >
              {geoBusy ? 'Locating…' : '📍 Use my current location'}
            </button>

            <p className="coord-display">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
            {geoError && <p className="err">{geoError}</p>}
          </div>

          <div className="field">
            <label htmlFor="personality">Personality</label>
            <textarea
              id="personality"
              rows={2}
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="e.g. Shy, comes out at dusk"
            />
          </div>

          <div className="field">
            <label htmlFor="watchOut">What to look out for</label>
            <textarea
              id="watchOut"
              rows={2}
              value={watchOut}
              onChange={(e) => setWatchOut(e.target.value)}
              placeholder="e.g. Limps on left hind leg"
            />
          </div>

          <div className="field">
            <label htmlFor="health">Health notes</label>
            <textarea
              id="health"
              rows={2}
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              placeholder="e.g. Skin allergy, on medication"
            />
          </div>

          <div className="field">
            <label htmlFor="food">Preferred foods</label>
            <input
              id="food"
              value={preferredFoods}
              onChange={(e) => setPreferredFoods(e.target.value)}
              placeholder="e.g. Wet food only, doesn't like fish"
            />
          </div>

          <div className="actions">
            <button type="button" className="btn secondary" onClick={cancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={saving || !name.trim()}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
