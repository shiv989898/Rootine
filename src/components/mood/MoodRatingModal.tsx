import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { usePreferences } from '@/contexts/PreferencesContext';
import { SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';

type MoodRating = 1 | 2 | 3 | 4 | 5;

type MoodRatingModalProps = {
  visible: boolean;
  habitTitle?: string;
  onClose: () => void;
  onSubmit: (payload: { rating: MoodRating; note?: string }) => void;
};

const RATING_OPTIONS: Array<{ value: MoodRating; icon: string; label: string; color: string }> = [
  { value: 1, icon: 'emoticon-cry-outline', label: 'Drained', color: '#EF5350' },
  { value: 2, icon: 'emoticon-sad-outline', label: 'Off', color: '#FF7043' },
  { value: 3, icon: 'emoticon-neutral-outline', label: 'Neutral', color: '#FFB74D' },
  { value: 4, icon: 'emoticon-happy-outline', label: 'Good', color: '#66BB6A' },
  { value: 5, icon: 'emoticon-excited-outline', label: 'Energized', color: '#42A5F5' },
];

const MoodRatingModal: React.FC<MoodRatingModalProps> = ({ visible, habitTitle, onClose, onSubmit }) => {
  const { themePalette } = usePreferences();
  const [rating, setRating] = useState<MoodRating | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setRating(null);
      setNote('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!rating) {
      return;
    }
    onSubmit({ rating, note: note.trim() ? note.trim() : undefined });
    onClose();
  };

  const styles = createStyles(themePalette);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.modal} edges={['bottom']}>
          <View>
            <Text style={styles.title}>How did that feel?</Text>
            <Text style={styles.subtitle}>
              {habitTitle ? `After finishing “${habitTitle}”` : 'Log your mood to spot trends'}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            {RATING_OPTIONS.map((option) => {
              const isSelected = rating === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.ratingButton,
                    isSelected && {
                      backgroundColor: `${option.color}25`,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setRating(option.value)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={option.icon as any}
                    size={28}
                    color={isSelected ? option.color : themePalette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.ratingLabel,
                      isSelected && { color: option.color, fontWeight: '700' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Add a note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Reflections, triggers, breakthroughs…"
              placeholderTextColor={`${themePalette.textSecondary}AA`}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !rating && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!rating}
            >
              <Text style={styles.saveText}>Log Mood</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (palette: AppTheme['palette']) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: palette.surface,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      padding: SPACING.lg,
      gap: SPACING.lg,
    },
    title: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '700',
      color: palette.text,
    },
    subtitle: {
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
      marginTop: SPACING.xs,
    },
    ratingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    ratingButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: palette.divider,
      marginHorizontal: SPACING.xs,
      backgroundColor: palette.background,
    },
    ratingLabel: {
      marginTop: SPACING.xs,
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
    },
    noteContainer: {
      backgroundColor: palette.background,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
    },
    noteLabel: {
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
      marginBottom: SPACING.sm,
    },
    noteInput: {
      minHeight: 80,
      textAlignVertical: 'top',
      color: palette.text,
      fontSize: FONT_SIZES.md,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    cancelText: {
      color: palette.textSecondary,
      fontSize: FONT_SIZES.md,
    },
    saveButton: {
      flex: 1,
      backgroundColor: palette.primary,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.round,
      alignItems: 'center',
    },
    saveText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: FONT_SIZES.md,
    },
  });

export default MoodRatingModal;
