import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { SPACING, FONT_SIZES, RADIUS, ACTIVITY_LEVELS, DIETARY_PREFERENCES } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { AppTheme } from '@/constants/themes';

const ProfileSetupScreen = () => {
  const { user, updateProfile, signInAsGuest } = useAuth();
  const [step, setStep] = useState(1);
  const { themePalette } = usePreferences();
  const styles = useMemo(() => createStyles(themePalette), [themePalette]);
  
  // Profile data
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('prefer-not-to-say');
  const [activityLevel, setActivityLevel] = useState<string>('sedentary');
  const [dietaryPreference, setDietaryPreference] = useState<string>('vegetarian');
  const [allergies, setAllergies] = useState<string>('');
  const [goals, setGoals] = useState<string>('');

  const handleGuestMode = async () => {
    try {
      await signInAsGuest();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to continue as guest');
    }
  };

  const handleComplete = async () => {
    try {
      const allergiesArray = allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const goalsArray = goals
        .split(',')
        .map(g => g.trim())
        .filter(g => g.length > 0);

      await updateProfile({
        age: age ? parseInt(age) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        gender,
        activityLevel: activityLevel as any,
        dietaryPreference: dietaryPreference as any,
        allergies: allergiesArray,
        goals: goalsArray,
      });

      // User profile updated - AuthContext will automatically navigate to MainTabs
      // No need to manually navigate, the App.tsx will re-render with user authenticated
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your height"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionsContainer}>
                {['male', 'female', 'other', 'prefer-not-to-say'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.optionButton,
                      gender === g && styles.optionButtonActive,
                    ]}
                    onPress={() => setGender(g as any)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        gender === g && styles.optionTextActive,
                      ]}
                    >
                      {g.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Activity & Diet</Text>
            <Text style={styles.stepSubtitle}>Tell us about your lifestyle</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Level</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsContainer}>
                  {ACTIVITY_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.activityCard,
                        activityLevel === level.value && styles.activityCardActive,
                      ]}
                      onPress={() => setActivityLevel(level.value)}
                    >
                      <Text
                        style={[
                          styles.activityLabel,
                          activityLevel === level.value && styles.activityLabelActive,
                        ]}
                      >
                        {level.label}
                      </Text>
                      <Text style={styles.activityDescription}>{level.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dietary Preference</Text>
              <View style={styles.optionsContainer}>
                {DIETARY_PREFERENCES.map((pref) => (
                  <TouchableOpacity
                    key={pref.value}
                    style={[
                      styles.optionButton,
                      dietaryPreference === pref.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setDietaryPreference(pref.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        dietaryPreference === pref.value && styles.optionTextActive,
                      ]}
                    >
                      {pref.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Allergies (comma-separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Peanuts, Shellfish"
                value={allergies}
                onChangeText={setAllergies}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Goals (comma-separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Lose weight, Build muscle"
                value={goals}
                onChangeText={setGoals}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Icon name="leaf" size={60} color={themePalette.primary} />
            <Text style={styles.title}>Setup Your Profile</Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]}
              />
            </View>
          </View>

          {renderStep()}

          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.buttonTextSecondary}>Back</Text>
              </TouchableOpacity>
            )}

            {step < 2 ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setStep(step + 1)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={handleComplete}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>

          {!user && step === 1 && (
            <TouchableOpacity onPress={handleGuestMode}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (palette: AppTheme['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: SPACING.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    emoji: {
      fontSize: 60,
      marginBottom: SPACING.md,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: SPACING.md,
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: palette.divider,
      borderRadius: 2,
      marginTop: SPACING.md,
    },
    progressFill: {
      height: '100%',
      backgroundColor: palette.primary,
      borderRadius: 2,
    },
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: SPACING.sm,
    },
    stepSubtitle: {
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
      marginBottom: SPACING.lg,
    },
    inputGroup: {
      marginBottom: SPACING.lg,
    },
    label: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: palette.text,
      marginBottom: SPACING.sm,
    },
    input: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: FONT_SIZES.md,
      color: palette.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    optionButton: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    optionButtonActive: {
      borderColor: palette.primary,
      backgroundColor: `${palette.primary}22`,
    },
    optionText: {
      fontSize: FONT_SIZES.sm,
      color: palette.text,
    },
    optionTextActive: {
      color: palette.primary,
      fontWeight: '600',
    },
    activityCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 2,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      marginRight: SPACING.sm,
      width: 180,
    },
    activityCardActive: {
      borderColor: palette.primary,
      backgroundColor: `${palette.primary}22`,
    },
    activityLabel: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: palette.text,
      marginBottom: SPACING.xs,
    },
    activityLabelActive: {
      color: palette.primary,
    },
    activityDescription: {
      fontSize: FONT_SIZES.xs,
      color: palette.textSecondary,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.xl,
    },
    button: {
      flex: 1,
      backgroundColor: palette.primary,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: palette.primary,
    },
    buttonText: {
      color: palette.onPrimary,
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
    },
    buttonTextSecondary: {
      color: palette.primary,
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
    },
    skipText: {
      textAlign: 'center',
      color: palette.textSecondary,
      fontSize: FONT_SIZES.md,
      marginTop: SPACING.md,
    },
  });

export default ProfileSetupScreen;
