import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '@/types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });

      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a notification for a habit reminder
 */
export const scheduleHabitReminder = async (
  habit: Habit
): Promise<string | null> => {
  try {
    if (!habit.reminder || !habit.reminderTime) {
      return null;
    }

    // Cancel existing reminder if any
    if (habit.reminderId) {
      await Notifications.cancelScheduledNotificationAsync(habit.reminderId);
    }

    // Parse reminder time (format: "HH:MM")
    const [hours, minutes] = habit.reminderTime.split(':').map(Number);

    // Calculate trigger
    const trigger: Notifications.NotificationTriggerInput = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Time for ${habit.name}!`,
        body: habit.description || 'Don\'t forget to complete your habit today',
        data: { habitId: habit.id, type: 'habit-reminder' },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      },
      trigger,
    });

    console.log(`Scheduled reminder for ${habit.name} at ${habit.reminderTime}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling habit reminder:', error);
    return null;
  }
};

/**
 * Cancel a scheduled habit reminder
 */
export const cancelHabitReminder = async (reminderId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
    console.log(`Cancelled reminder: ${reminderId}`);
  } catch (error) {
    console.error('Error cancelling habit reminder:', error);
  }
};

/**
 * Cancel all habit reminders
 */
export const cancelAllHabitReminders = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all reminders');
  } catch (error) {
    console.error('Error cancelling all reminders:', error);
  }
};

/**
 * Send immediate notification (for testing or instant alerts)
 */
export const sendImmediateNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Send achievement notification
 */
export const sendAchievementNotification = async (
  title: string,
  description: string
): Promise<void> => {
  await sendImmediateNotification(
    `🏆 ${title}`,
    description,
    { type: 'achievement' }
  );
};

/**
 * Send streak notification
 */
export const sendStreakNotification = async (
  habitName: string,
  streakCount: number
): Promise<void> => {
  await sendImmediateNotification(
    `🔥 ${streakCount} Day Streak!`,
    `Amazing! You've maintained your ${habitName} habit for ${streakCount} days straight!`,
    { type: 'streak', count: streakCount }
  );
};

/**
 * Send challenge completion notification
 */
export const sendChallengeNotification = async (
  challengeTitle: string,
  points: number
): Promise<void> => {
  await sendImmediateNotification(
    `✅ Challenge Complete!`,
    `You completed "${challengeTitle}" and earned ${points} points!`,
    { type: 'challenge', points }
  );
};

/**
 * Send motivational notification
 */
export const sendMotivationalNotification = async (): Promise<void> => {
  const messages = [
    "You're doing great! Keep it up! 💪",
    "Don't break the chain! Complete your habits today! 🔥",
    "Small steps lead to big changes! 🌟",
    "Your future self will thank you! 🎯",
    "Progress over perfection! 📈",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  await sendImmediateNotification(
    "Daily Motivation",
    randomMessage,
    { type: 'motivational' }
  );
};

/**
 * Initialize notifications on app start
 */
export const initializeNotifications = async (): Promise<boolean> => {
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    console.log('✅ Notifications initialized successfully');
  } else {
    console.log('❌ Notification permissions denied');
  }

  return hasPermission;
};
