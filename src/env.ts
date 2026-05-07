// Firebase config is loaded from .env.local at build/dev time via Vite.
// See .env.example for the variable names and copy it to .env.local.
const env = import.meta.env;

function required(name: keyof ImportMetaEnv): string {
  const v = env[name];
  if (!v) throw new Error(`Missing required env var: ${String(name)} (set it in .env.local)`);
  return v;
}

export const environment = {
  firebase: {
    apiKey: required('VITE_FIREBASE_API_KEY'),
    authDomain: required('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: required('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: required('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: required('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: required('VITE_FIREBASE_APP_ID'),
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  },
};
