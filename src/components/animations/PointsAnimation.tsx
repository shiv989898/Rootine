import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface PointsAnimationProps {
  points: number;
  visible: boolean;
  onComplete?: () => void;
  type?: 'habit' | 'challenge' | 'streak' | 'levelup';
}

export default function PointsAnimation({
  points,
  visible,
  onComplete,
  type = 'habit',
}: PointsAnimationProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // TODO: Add haptic feedback when expo-haptics is installed
      // if (type === 'levelup') {
      //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // } else {
      //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // }

      // Reset animations
      translateY.setValue(0);
      opacity.setValue(1);
      scale.setValue(0.5);

      // Start animation sequence
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: type === 'levelup' ? 2000 : 1500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(type === 'levelup' ? 1500 : 1000),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (onComplete) onComplete();
      });
    }
  }, [visible, points, type]);

  if (!visible) return null;

  const getColor = () => {
    switch (type) {
      case 'levelup':
        return '#FFD700'; // Gold
      case 'challenge':
        return '#9C27B0'; // Purple
      case 'streak':
        return '#FF6B6B'; // Red
      default:
        return '#4CAF50'; // Green
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'levelup':
        return 'arrow-up-bold-circle';
      case 'challenge':
        return 'trophy';
      case 'streak':
        return 'fire';
      default:
        return 'star';
    }
  };

  const color = getColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Icon name={getIcon() as any} size={24} color={color} />
      <Text style={[styles.text, { color }]}>
        {points > 0 ? '+' : ''}
        {points} pts
      </Text>
      {type === 'levelup' && (
        <Text style={[styles.levelUpText, { color }]}>Level Up!</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  levelUpText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
