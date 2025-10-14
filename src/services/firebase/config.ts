import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  Auth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
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

// Initialize Firebase Auth with AsyncStorage persistence
// This ensures users stay logged in even after closing the app
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If initializeAuth fails (e.g., already initialized), get existing auth
  auth = getAuth(app);
}

export { auth };

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
