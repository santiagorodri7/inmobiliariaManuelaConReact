import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
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

export const allowBase64Fallback =
  String(env.VITE_ALLOW_BASE64_FALLBACK || "false").toLowerCase() === "true";

export const requireFirebase = () => {
  if (!isFirebaseConfigured) {
    const error = new Error(
      "Firebase no está configurado. Revisa el archivo .env.local.",
    );
    error.code = "app/not-configured";
    throw error;
  }
};
