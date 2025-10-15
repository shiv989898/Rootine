import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import { RootStackParamList } from '@/types';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { isValidEmail } from '@/utils/helpers';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const googleSignIn = useGoogleSignIn();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn.signIn();
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Icon name="leaf" size={60} color={COLORS.primary} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} placeholder="your.email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={[styles.googleButton, (googleSignIn.loading || googleSignIn.disabled) && styles.buttonDisabled]} 
              onPress={handleGoogleSignIn}
              disabled={googleSignIn.loading || googleSignIn.disabled}
            >
              <Icon name="google" size={24} color="#DB4437" />
              <Text style={styles.googleButtonText}>
                {googleSignIn.loading ? 'Signing in with Google...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.md },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
  form: { flex: 1 },
  inputContainer: { marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: SPACING.lg },
  forgotPasswordText: { color: COLORS.primary, fontSize: FONT_SIZES.sm },
  button: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.md },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: FONT_SIZES.lg, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border || '#E0E0E0' },
  dividerText: { paddingHorizontal: SPACING.md, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  googleButton: { 
    backgroundColor: '#FFFFFF', 
    padding: SPACING.md, 
    borderRadius: RADIUS.md, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: SPACING.sm,
  },
  googleButtonText: { color: '#333333', fontSize: FONT_SIZES.lg, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  footerLink: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
});

export default LoginScreen;
