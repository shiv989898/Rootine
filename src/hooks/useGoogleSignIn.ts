import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';

// Important: This enables dismissing the browser on Android
WebBrowser.maybeCompleteAuthSession();

// Replace these with your actual Google OAuth credentials
// Get them from: https://console.cloud.google.com/
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';

export const useGoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  // Configure Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const signIn = async () => {
    try {
      setLoading(true);
      
      // Prompt user to sign in with Google
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const { authentication } = result;
        
        if (authentication?.idToken) {
          // Sign in to Firebase with the Google ID token
          await signInWithGoogle(authentication.idToken);
        } else {
          throw new Error('No ID token returned from Google');
        }
      } else if (result?.type === 'error') {
        throw new Error('Google Sign-In failed');
      }
      // If type is 'cancel' or 'dismiss', we don't throw an error
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    disabled: !request,
  };
};
