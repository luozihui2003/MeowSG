import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as L from 'leaflet';
import { useCats } from '../cats';
import { useTodaysFeedings } from '../feedings';

const SG_CENTER: L.LatLngTuple = [1.3521, 103.8198];

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
    }
    return c;
  });
}

export function MapPage() {
  const cats = useCats();
  const feeds = useTodaysFeedings();
  const navigate = useNavigate();
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapElRef.current) return;
    const map = L.map(mapElRef.current).setView(SG_CENTER, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const cat of cats) {
      const fedCount = feeds.filter((l) => l.catId === cat.id).length;
      const fedLabel =
        fedCount > 0
          ? `<span style="color:#5a8a72;font-weight:600">Fed today (${fedCount})</span>`
          : `<span style="color:#c62828;font-weight:600">Not fed yet</span>`;
      const popup = `
        <strong>${escapeHtml(cat.name || '(unnamed)')}</strong><br>
        ${escapeHtml(cat.color || '')}<br>
        ${fedLabel}<br>
        <a href="#/cats/${cat.id}" data-cat-id="${cat.id}">Open details →</a>
      `;
      const marker = L.marker([cat.location.lat, cat.location.lng], { icon: DefaultIcon });
      marker.bindPopup(popup);
      marker.on('popupopen', (ev) => {
        const popupEl = ev.popup.getElement();
        const link = popupEl?.querySelector<HTMLAnchorElement>('a[data-cat-id]');
        if (link) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(`/cats/${cat.id}`);
          });
        }
      });
      layer.addLayer(marker);
    }
  }, [cats, feeds, navigate]);

  return (
    <>
      <h2>Map</h2>
      <p className="muted small">Tap a marker to see who fed which cat today.</p>
      <div ref={mapElRef} className="map" />
    </>
  );
}
