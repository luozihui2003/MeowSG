# MeowSG

A community PWA for cat feeders in Singapore to track stray cats: where they are, who's
feeding them, whether they've been fed today, and care notes (color, neutered status, personality, health, preferred foods, things to look out for).

Built with React 18 + Vite + Firebase (Firestore + Auth) + Leaflet (OpenStreetMap).
Mobile-first; installable on iOS via Safari → Share → "Add to Home Screen".

## Features

- 🔐 Google sign-in
- 🐱 Add / edit / delete cat profiles (only the creator can edit their own cats)
- 📍 Geolocation: tap "Use my current location" to pin a cat where you are
- 🗺️ Map view of all cats (Leaflet + OpenStreetMap, no API key)
- 🍽️ "I just fed this cat" button — logs feeder + time, visible to all users
- ✅ Cat list shows "Fed today" / "Not fed" plus who fed last
- 🔍 Search by name, color, or area

## One-time Firebase setup

1. Go to https://console.firebase.google.com and create a new project.
2. Enable **Authentication** → Sign-in method → **Google** → Enable.
3. Enable **Firestore Database** in production mode (any region; `asia-southeast1` is closest to SG).
4. Project settings → Your apps → Add a **Web app**, copy the `firebaseConfig` object.
5. Paste those values into `src/env.ts` (replace the `REPLACE_ME`s).
6. Open `.firebaserc` and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with your project ID.
7. Deploy the security rules:
   ```bash
   firebase login
   firebase deploy --only firestore:rules
   ```

## Run locally

```bash
npm install
npm start          # http://localhost:4200
```

To test from your iPhone on the same Wi-Fi:
```bash
npm start -- --host 0.0.0.0
```
Then visit `http://<your-mac-ip>:4200` in Safari on your phone. Add Firebase Auth's
authorized domains to include your machine's local IP if Google sign-in fails.

> **Note**: Geolocation in browsers requires HTTPS (or `localhost`). For phone testing
> over your local network, deploy a quick preview to Firebase Hosting (HTTPS) instead.

## Deploy

```bash
npm run build
firebase deploy
```

The hosted URL will work as a PWA on iOS — open in Safari and tap Share → Add to Home Screen.

## Project layout

```
index.html                        # Vite entry; PWA meta tags
src/
├── env.ts                        # ← put your Firebase config here
├── styles.scss                   # global styles + Leaflet CSS
├── main.tsx                      # React entry (mounts <App />)
├── App.tsx                       # routes
├── Layout.tsx                    # shell: top bar + bottom nav
├── RequireAuth.tsx               # route guard
├── firebase.ts                   # Firebase init (lazy singletons)
├── types.ts                      # Cat, FeedingLog, AppUser interfaces
├── auth.tsx                      # AuthContext + useAuth hook
├── cats.ts                       # useCats hook + CRUD
├── feedings.ts                   # useTodaysFeedings hook + logFeed
└── pages/
    ├── LoginPage.tsx             # Sign-in screen
    ├── CatListPage.tsx           # All cats with "fed today" status + search
    ├── CatDetailPage.tsx         # Profile, feed log, "I just fed" button
    ├── CatEditPage.tsx           # Add or edit (creator-only)
    └── MapPage.tsx               # Leaflet map of all cats
```

## Firestore data model

```
cats/{catId}
  name, color, isNeutered, personality, healthNotes, watchOut, preferredFoods,
  location { lat, lng }, areaDescription, photoUrl,
  createdByUid, createdByName, createdAt, updatedAt

feedings/{logId}
  catId, feederUid, feederName, fedAt, notes
```

Security rules (`firestore.rules`):
- Anyone signed in can read all cats and feedings.
- Cat creator is the only one who can edit/delete that cat.
- Anyone signed in can log a feeding for any cat — but only as themselves. Logs are immutable.

## Things to consider next

- Photo upload (Firebase Storage) — schema field `photoUrl` is already present.
- Push notifications when a cat hasn't been fed in 24h.
- Native iOS wrapper via Capacitor if you want App Store distribution.
- A "report sighting" flow distinct from feeding (for cats you spotted but didn't feed).
