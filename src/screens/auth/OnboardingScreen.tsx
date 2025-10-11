import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Icon name="leaf" size={80} color={COLORS.primary} />
          <Text style={styles.appName}>Rootine</Text>
          <Text style={styles.tagline}>Build Better Habits</Text>
        </View>
        <View style={styles.featuresContainer}>
          <FeatureItem icon="chart-line" text="Track Your Progress" />
          <FeatureItem icon="trophy" text="Complete Challenges" />
          <FeatureItem icon="account-group" text="Connect with Friends" />
          <FeatureItem icon="food-apple" text="AI-Powered Diet Plans" />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <Icon name={icon as any} size={24} color={COLORS.primary} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.xl, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginTop: 60 },
  appName: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary, marginTop: SPACING.md },
  tagline: { fontSize: FONT_SIZES.lg, color: COLORS.textSecondary, marginTop: SPACING.xs },
  featuresContainer: { marginVertical: SPACING.xl },
  featureItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  featureText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginLeft: SPACING.md },
  buttonContainer: { gap: SPACING.md },
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOWS.md },
  primaryButtonText: { color: '#FFFFFF', fontSize: FONT_SIZES.lg, fontWeight: '600' },
  secondaryButton: { backgroundColor: 'transparent', paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
  secondaryButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '600' },
});

export default OnboardingScreen;
