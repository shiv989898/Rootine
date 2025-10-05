import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Habit } from '@/types';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onPress: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isCompleted,
  onToggle,
  onPress,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.container, isCompleted && styles.completed]}>
        <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
          <Icon name={habit.icon} size={24} color={COLORS.white} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {habit.title}
          </Text>
          {habit.description && (
            <Text style={styles.description} numberOfLines={1}>
              {habit.description}
            </Text>
          )}
          <View style={styles.footer}>
            <View style={styles.streakContainer}>
              <Icon name="fire" size={16} color={COLORS.orange} />
              <Text style={styles.streakText}>
                {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={styles.category}>{habit.category}</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            onPress={handleToggle}
            style={[
              styles.checkbox,
              isCompleted && styles.checkboxCompleted,
            ]}
          >
            {isCompleted && (
              <Icon name="check" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
  },
  completed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  category: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
    textTransform: 'capitalize',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});
