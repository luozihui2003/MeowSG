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

## Setup (after cloning)

You need **your own Firebase project** — Firebase Auth users and Firestore data are scoped per-project, and the real config values are not committed to this repo (only `.env.example` is). One-time setup:

### 1. Create a Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. **Authentication** → Sign-in method → **Google** → Enable, then set a support email.
3. **Firestore Database** → Create database → Start in **production mode** → pick a region (`asia-southeast1` is closest to SG; this is permanent).
4. Project settings (⚙) → Your apps → click the **Web** icon (`</>`) to register a web app → copy the `firebaseConfig` object that appears.

### 2. Add your config locally

Copy the template and fill in the values from step 1.4:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-...      # optional, only if you enabled Analytics
```

`.env.local` is gitignored — never commit it.

### 3. Point the Firebase CLI at your project (only needed for deploying)

Edit `.firebaserc` and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with your `projectId`. Then deploy the Firestore security rules and indexes:

```bash
npm install -g firebase-tools     # one-time, if you don't have it
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

> If you skip this step and start in test mode in the console, the app will work for ~30 days before rules lock down. Deploying the rules from this repo is the permanent fix.

## Run locally

```bash
npm install
npm start          # http://localhost:4200
```

> Restart `npm start` whenever you change `.env.local` — Vite only reads env files at server start.

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
.env.example                      # template — copy to .env.local and fill in
.env.local                        # YOUR Firebase config (gitignored)
index.html                        # Vite entry; PWA meta tags
src/
├── env.ts                        # reads Firebase config from import.meta.env
├── vite-env.d.ts                 # types for VITE_* env vars
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
  name, color, sex ('male' | 'female' | 'unsure'), isNeutered,
  personality, healthNotes, watchOut, preferredFoods,
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
