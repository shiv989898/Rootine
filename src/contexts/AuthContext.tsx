import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/firebase/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User['profile']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      // Check for guest user
      const guestData = await AsyncStorage.getItem('guestUser');
      if (guestData) {
        const guestUser = JSON.parse(guestData);
        setUser(guestUser);
        setLoading(false);
        return;
      }

      // Check for authenticated user
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Check user session error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userData = await authService.signIn(email, password);
      setUser(userData);
      await AsyncStorage.removeItem('guestUser');
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userData = await authService.signUp(email, password, displayName);
      setUser(userData);
      await AsyncStorage.removeItem('guestUser');
    } catch (error) {
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      const guestUser = await authService.signInAsGuest();
      setUser(guestUser);
      await AsyncStorage.setItem('guestUser', JSON.stringify(guestUser));
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (user?.isGuest) {
        await AsyncStorage.removeItem('guestUser');
      } else {
        await authService.signOut();
      }
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User['profile']>) => {
    if (!user) return;

    try {
      const updatedProfile = { ...user.profile, ...updates };
      
      if (!user.isGuest) {
        await authService.updateUserProfile(user.id, updatedProfile);
      }

      const updatedUser = {
        ...user,
        profile: updatedProfile,
        updatedAt: new Date(),
      };

      setUser(updatedUser);

      if (user.isGuest) {
        await AsyncStorage.setItem('guestUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
