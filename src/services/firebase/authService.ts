import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserProfile } from '@/types';
import { generateInviteCode } from '@/utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName: string): Promise<User> => {
    let firebaseUser: any = null;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        activityLevel: 'sedentary',
        dietaryPreference: 'vegetarian',
        allergies: [],
        goals: [],
        points: 0,
        level: 1,
        badges: [],
        streakDays: 0,
        longestStreak: 0,
        isPremium: false,
        inviteCode: generateInviteCode(),
        friends: [],
      };

      const user: Omit<User, 'createdAt' | 'updatedAt'> & { photoURL?: string | null } = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
        isGuest: false,
        profile: userProfile,
      };

      // Try to create Firestore document
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...user,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Firestore user document created successfully');
      } catch (firestoreError: any) {
        console.error('❌ Firestore document creation failed:', firestoreError);
        // Delete the Firebase Auth user since Firestore creation failed
        await firebaseUser.delete();
        throw new Error(`Failed to create user profile: ${firestoreError.message}. Please check Firestore security rules.`);
      }

      return { ...user, createdAt: new Date(), updatedAt: new Date() };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please try signing in or use a different email.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      
      throw new Error(error.message || 'Failed to sign up');
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData.displayName,
        ...(firebaseUser.photoURL || userData.photoURL ? { photoURL: firebaseUser.photoURL || userData.photoURL } : {}),
        isGuest: false,
        profile: userData.profile,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.');
      } else if (error.message === 'User profile not found') {
        throw new Error('Account exists but profile is incomplete. Please contact support or try signing up again.');
      }
      
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  // Sign in as guest
  signInAsGuest: async (): Promise<User> => {
    const guestId = `guest_${Date.now()}`;
    const guestProfile: UserProfile = {
      activityLevel: 'sedentary',
      dietaryPreference: 'vegetarian',
      allergies: [],
      goals: [],
      points: 0,
      level: 1,
      badges: [],
      streakDays: 0,
      longestStreak: 0,
      isPremium: false,
      inviteCode: generateInviteCode(),
      friends: [],
    };

    return {
      id: guestId,
      email: `guest_${guestId}@rootine.app`,
      displayName: 'Guest User',
      isGuest: true,
      profile: guestProfile,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  // Sign in with Google
  signInWithGoogle: async (idToken: string): Promise<User> => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        // Existing user - return their data
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || userData.displayName,
          ...(firebaseUser.photoURL || userData.photoURL ? { photoURL: firebaseUser.photoURL || userData.photoURL } : {}),
          isGuest: false,
          profile: userData.profile,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
      } else {
        // New user - create profile
        const userProfile: UserProfile = {
          activityLevel: 'sedentary',
          dietaryPreference: 'vegetarian',
          allergies: [],
          goals: [],
          points: 0,
          level: 1,
          badges: [],
          streakDays: 0,
          longestStreak: 0,
          isPremium: false,
          inviteCode: generateInviteCode(),
          friends: [],
        };

        const user: Omit<User, 'createdAt' | 'updatedAt'> = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'User',
          ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
          isGuest: false,
          profile: userProfile,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...user,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return { ...user, createdAt: new Date(), updatedAt: new Date() };
      }
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Clear any stored auth tokens
      await AsyncStorage.removeItem('userToken');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profile: updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData.displayName,
        ...(firebaseUser.photoURL || userData.photoURL ? { photoURL: firebaseUser.photoURL || userData.photoURL } : {}),
        isGuest: false,
        profile: userData.profile,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  },
};

// Export named functions for easier importing
export const { signUp, signIn, signInAsGuest, signInWithGoogle, signOut, updateUserProfile, getCurrentUser, resetPassword } = authService;
