import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AsyncStorageLike = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
};

// Lightweight replica of Firebase's getReactNativePersistence helper removed in v11 exports.
const createReactNativePersistence = (storage: AsyncStorageLike | undefined | null) => {
  const STORAGE_AVAILABLE_KEY = '__firebase_auth_storage_available__';

  return class {
    static type = 'LOCAL' as const;
    type = 'LOCAL' as const;

    async _isAvailable() {
      try {
        if (!storage) {
          return false;
        }

        await storage.setItem(STORAGE_AVAILABLE_KEY, '1');
        await storage.removeItem(STORAGE_AVAILABLE_KEY);
        return true;
      } catch {
        return false;
      }
    }

    async _set(key: string, value: unknown) {
      if (!storage) {
        throw new Error('AsyncStorage unavailable for auth persistence.');
      }

      const serialized = JSON.stringify(value);
      await storage.setItem(key, serialized ?? 'null');
    }

    async _get(key: string) {
      if (!storage) {
        return null;
      }

      const json = await storage.getItem(key);
      return json ? JSON.parse(json) : null;
    }

    async _remove(key: string) {
      if (!storage) {
        return;
      }

      await storage.removeItem(key);
    }

    // React Native AsyncStorage does not support cross-tab change listeners.
    _addListener() {
      return;
    }

    _removeListener() {
      return;
    }
  };
};

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

// Initialize Firebase Auth with AsyncStorage persistence to keep users signed in between sessions.
type PersistenceConfig = NonNullable<Parameters<typeof initializeAuth>[1]>['persistence'];
const ReactNativeAsyncPersistence = createReactNativePersistence(AsyncStorage) as PersistenceConfig;

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: ReactNativeAsyncPersistence,
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
