import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { firebasePublicConfig } from "../config/firebasePublic.js";

const env = import.meta.env;

const pick = (value, fallback) => {
  const candidate = typeof value === "string" ? value.trim() : "";
  return candidate || fallback;
};

export const firebaseConfig = {
  apiKey: pick(env.VITE_FIREBASE_API_KEY, firebasePublicConfig.apiKey),
  authDomain: pick(
    env.VITE_FIREBASE_AUTH_DOMAIN,
    firebasePublicConfig.authDomain,
  ),
  projectId: pick(env.VITE_FIREBASE_PROJECT_ID, firebasePublicConfig.projectId),
  storageBucket: pick(
    env.VITE_FIREBASE_STORAGE_BUCKET,
    firebasePublicConfig.storageBucket,
  ),
  messagingSenderId: pick(
    env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    firebasePublicConfig.messagingSenderId,
  ),
  appId: pick(env.VITE_FIREBASE_APP_ID, firebasePublicConfig.appId),
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

export const isFirebaseConfigured = requiredKeys.every(
  (key) => Boolean(firebaseConfig[key]),
);

const existingApp = getApps()[0] || null;
export const app = isFirebaseConfigured
  ? existingApp || initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const functions = app
  ? getFunctions(app, env.VITE_FUNCTIONS_REGION || "us-central1")
  : null;

if (
  import.meta.env.DEV &&
  env.VITE_USE_FIREBASE_EMULATORS === "true" &&
  auth &&
  db &&
  storage
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

// El respaldo Base64 permite publicar cuando Storage no está disponible.
// Queda activo por defecto para que un clon nuevo funcione sin configuración;
// se desactiva explícitamente con VITE_ALLOW_BASE64_FALLBACK=false.
export const allowBase64Fallback = !["false", "0", "no"].includes(
  String(env.VITE_ALLOW_BASE64_FALLBACK ?? "true").trim().toLowerCase(),
);

export const requireFirebase = () => {
  if (!isFirebaseConfigured) {
    const error = new Error(
      "Firebase no está configurado. Revisa el archivo .env.local.",
    );
    error.code = "app/not-configured";
    throw error;
  }
};
