import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJqiyxR-DdxBrWew5uGHk2vPbkfolRBh4",
  authDomain: "rootine-d5bef.firebaseapp.com",
  projectId: "rootine-d5bef",
  storageBucket: "rootine-d5bef.firebasestorage.app",
  messagingSenderId: "374362967887",
  appId: "1:374362967887:web:254c828a782f4b48d9ff3a",
  measurementId: "G-FH44JK21GQ"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only works in web environment, will fail silently on mobile)
export let analytics: Analytics | null = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  // Analytics not supported in this environment (e.g., React Native)
  console.log('Firebase Analytics not available');
}

export default app;
