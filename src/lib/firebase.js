import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (!isDemo) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });

  // Enable offline persistence to reduce Firestore reads.
  // Falls back to single-tab if multi-tab fails.
  enableMultiTabIndexedDbPersistence(db).catch(() => {
    enableIndexedDbPersistence(db).catch(() => {
      console.warn("Firestore persistence unavailable");
    });
  });
}

export { auth, db, storage, googleProvider, isDemo };