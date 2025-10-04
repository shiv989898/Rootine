import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { Habit, HabitCategory, Recurrence } from '@/types';
import { createHabit, updateHabit } from '@/services/firebase/habitService';

interface CreateEditHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  habit?: Habit | null; // If provided, we're editing; otherwise, creating
}

// Available habit icons
const HABIT_ICONS = [
  'run', 'dumbbell', 'yoga', 'meditation', 'water', 'food-apple',
  'book-open', 'brain', 'sleep', 'pill', 'heart', 'leaf',
  'walk', 'bicycle', 'tooth', 'shower', 'bed', 'coffee',
];

// Available colors (using unique colors only)
const HABIT_COLORS = [
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#F44336', // Red
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FF6B6B', // Light Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Lavender
  '#85929E', // Gray Blue
  '#E91E63', // Pink
];

// Categories
const CATEGORIES: HabitCategory[] = [
  'health', 'fitness', 'mindfulness', 'productivity',
  'social', 'learning', 'nutrition', 'custom',
];

// Recurrence options
const RECURRENCE_TYPES: Array<'daily' | 'weekly' | 'custom'> = ['daily', 'weekly', 'custom'];

export const CreateEditHabitModal: React.FC<CreateEditHabitModalProps> = ({
  visible,
  onClose,
  onSuccess,
  habit,
}) => {
  const isEditing = !!habit;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [icon, setIcon] = useState('run');
  const [color, setColor] = useState(COLORS.primary);
  const [recurrence, setRecurrence] = useState<Recurrence>({ type: 'daily' });
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description);
      setCategory(habit.category);
      setIcon(habit.icon);
      setColor(habit.color);
      setRecurrence(habit.recurrence);
      setReminderEnabled(habit.reminderEnabled);
      setReminderTime(habit.reminderTime || '09:00');
    } else {
      // Reset form when creating new habit
      resetForm();
    }
  }, [habit, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('health');
    setIcon('run');
    setColor(COLORS.primary);
    setRecurrence({ type: 'daily' });
    setReminderEnabled(false);
    setReminderTime('09:00');
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a habit name');
      return false;
    }
    if (title.length < 3) {
      Alert.alert('Validation Error', 'Habit name must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const habitData = {
        title: title.trim(),
        description: description.trim(),
        category,
        icon,
        color,
        recurrence,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
      };

      if (isEditing) {
        await updateHabit(habit.id, habitData);
      } else {
        await createHabit(habitData);
      }

      Alert.alert(
        'Success',
        isEditing ? 'Habit updated successfully' : 'Habit created successfully'
      );
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Habit' : 'Create Habit'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Icon name="check" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Habit Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Run, Read 30 Minutes"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              autoFocus={!isEditing}
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add more details about your habit..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionButton,
                    category === cat && styles.optionButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      category === cat && styles.optionTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Icon Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconButton,
                    icon === iconName && {
                      backgroundColor: color,
                      borderColor: color,
                    },
                  ]}
                  onPress={() => setIcon(iconName)}
                >
                  <Icon
                    name={iconName}
                    size={24}
                    color={icon === iconName ? COLORS.white : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {HABIT_COLORS.map((colorOption, index) => (
                <TouchableOpacity
                  key={`color-${index}-${colorOption}`}
                  style={[
                    styles.colorButton,
                    { backgroundColor: colorOption },
                    color === colorOption && styles.colorButtonActive,
                  ]}
                  onPress={() => setColor(colorOption)}
                >
                  {color === colorOption && (
                    <Icon name="check" size={20} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recurrence */}
          <View style={styles.section}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.optionsRow}>
              {RECURRENCE_TYPES.map((recType) => (
                <TouchableOpacity
                  key={recType}
                  style={[
                    styles.optionButton,
                    recurrence.type === recType && styles.optionButtonActive,
                  ]}
                  onPress={() => setRecurrence({ type: recType })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      recurrence.type === recType && styles.optionTextActive,
                    ]}
                  >
                    {recType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reminder */}
          <View style={styles.section}>
            <View style={styles.reminderHeader}>
              <View>
                <Text style={styles.label}>Daily Reminder</Text>
                <Text style={styles.sublabel}>
                  Get notified to complete your habit
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {reminderEnabled && (
              <View style={styles.timeSelector}>
                <Icon name="clock-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.timeInput}
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                />
                <Text style={styles.timeHint}>24-hour format (HH:MM)</Text>
              </View>
            )}
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.label}>Preview</Text>
            <View style={[styles.preview, { borderLeftColor: color }]}>
              <View style={[styles.previewIcon, { backgroundColor: color }]}>
                <Icon name={icon} size={24} color={COLORS.white} />
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>
                  {title || 'Your Habit Name'}
                </Text>
                <Text style={styles.previewDescription}>
                  {description || 'Your habit description'}
                </Text>
                <Text style={styles.previewMeta}>
                  {category} • {recurrence.type}
                  {reminderEnabled && ` • ${reminderTime}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Habit' : 'Create Habit'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Delete Button (only when editing) */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteButton} onPress={onClose}>
              <Text style={styles.deleteButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sublabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: COLORS.white,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  timeInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  timeHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  preview: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    borderLeftWidth: 4,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  previewDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  previewMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  deleteButton: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  deleteButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
});
