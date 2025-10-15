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
  signInWithGoogle: (idToken: string) => Promise<void>;
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
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        const guestData = await AsyncStorage.getItem('guestUser');
        if (guestData && isMounted) {
          const guestUser = JSON.parse(guestData);
          setUser(guestUser);
          setLoading(false);
        }

        unsubscribe = authService.subscribeToAuthChanges(async (currentUser) => {
          if (!isMounted) {
            return;
          }

          if (currentUser) {
            setUser(currentUser);
            await AsyncStorage.removeItem('guestUser');
          } else {
            const storedGuest = await AsyncStorage.getItem('guestUser');
            if (storedGuest) {
              setUser(JSON.parse(storedGuest));
            } else {
              setUser(null);
            }
          }

          setLoading(false);
        });
      } catch (error) {
        console.error('Initialize auth error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userData = await authService.signIn(email, password);
      setUser(userData);
      await AsyncStorage.removeItem('guestUser');
      // Store auth token for persistence
      await AsyncStorage.setItem('userToken', userData.id);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userData = await authService.signUp(email, password, displayName);
      setUser(userData);
      await AsyncStorage.removeItem('guestUser');
      // Store auth token for persistence
      await AsyncStorage.setItem('userToken', userData.id);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    try {
      const userData = await authService.signInWithGoogle(idToken);
      setUser(userData);
      await AsyncStorage.removeItem('guestUser');
      // Store auth token for persistence
      await AsyncStorage.setItem('userToken', userData.id);
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
        await AsyncStorage.removeItem('userToken');
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
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
