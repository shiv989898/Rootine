import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
} from '@/services/notifications/notificationService';
import * as Haptics from 'expo-haptics';

interface ReminderSettingsModalProps {
  visible: boolean;
  habitId: string;
  habitTitle: string;
  existingReminder?: {
    enabled: boolean;
    time: Date;
    days: number[];
  };
  onClose: () => void;
  onSave: (reminderSettings: {
    enabled: boolean;
    time: Date;
    days: number[];
  }) => void;
}

const DAYS_OF_WEEK = [
  { id: 0, short: 'S', full: 'Sunday' },
  { id: 1, short: 'M', full: 'Monday' },
  { id: 2, short: 'T', full: 'Tuesday' },
  { id: 3, short: 'W', full: 'Wednesday' },
  { id: 4, short: 'T', full: 'Thursday' },
  { id: 5, short: 'F', full: 'Friday' },
  { id: 6, short: 'S', full: 'Saturday' },
];

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  visible,
  habitId,
  habitTitle,
  existingReminder,
  onClose,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(existingReminder?.enabled || false);
  const [reminderTime, setReminderTime] = useState(
    existingReminder?.time || new Date()
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    existingReminder?.days || [0, 1, 2, 3, 4, 5, 6]
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (existingReminder) {
      setEnabled(existingReminder.enabled);
      setReminderTime(existingReminder.time);
      setSelectedDays(existingReminder.days);
    }
  }, [existingReminder]);

  const handleToggleDay = (dayId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((d) => d !== dayId);
      }
      return [...prev, dayId].sort();
    });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const handleSave = async () => {
    if (selectedDays.length === 0 && enabled) {
      Alert.alert('Select Days', 'Please select at least one day for the reminder.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const settings = {
      enabled,
      time: reminderTime,
      days: selectedDays,
    };

    // Schedule or cancel notification
    try {
      if (enabled) {
        await scheduleHabitReminder({
          habitId,
          habitTitle,
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
        });
      } else {
        await cancelHabitReminder(habitId);
      }
      
      onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', 'Failed to save reminder settings');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reminder Settings</Text>
              <Text style={styles.subtitle}>{habitTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Enable/Disable Switch */}
            <View style={styles.section}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLeft}>
                  <Icon name="bell-ring" size={24} color={COLORS.primary} />
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Daily Reminder</Text>
                    <Text style={styles.switchDescription}>
                      Get notified to complete this habit
                    </Text>
                  </View>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setEnabled(value);
                  }}
                  trackColor={{ false: '#D1D5DB', true: COLORS.primary + '80' }}
                  thumbColor={enabled ? COLORS.primary : '#F3F4F6'}
                />
              </View>
            </View>

            {enabled && (
              <>
                {/* Time Picker */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Reminder Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowTimePicker(true);
                    }}
                  >
                    <Icon name="clock-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.timeButtonText}>{formatTime(reminderTime)}</Text>
                    <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={reminderTime}
                      mode="time"
                      is24Hour={false}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleTimeChange}
                    />
                  )}
                </View>

                {/* Days Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Repeat On</Text>
                  <View style={styles.daysContainer}>
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = selectedDays.includes(day.id);
                      return (
                        <TouchableOpacity
                          key={day.id}
                          style={[
                            styles.dayButton,
                            isSelected && styles.dayButtonSelected,
                          ]}
                          onPress={() => handleToggleDay(day.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dayButtonText,
                              isSelected && styles.dayButtonTextSelected,
                            ]}
                          >
                            {day.short}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.daysHelperText}>
                    {selectedDays.length === 7
                      ? 'Every day'
                      : selectedDays.length === 0
                      ? 'No days selected'
                      : `${selectedDays.length} day${selectedDays.length > 1 ? 's' : ''} selected`}
                  </Text>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                  <Icon name="information" size={20} color={COLORS.primary} />
                  <Text style={styles.infoText}>
                    You'll receive a notification at the selected time on the chosen days
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  switchLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  timeButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dayButtonTextSelected: {
    color: COLORS.white,
  },
  daysHelperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
