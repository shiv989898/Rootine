import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // Request notification permissions
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Request permissions error:', error);
      return false;
    }
  },

  // Schedule a habit reminder notification
  scheduleHabitReminder: async (
    habitId: string,
    habitTitle: string,
    time: string // HH:mm format
  ): Promise<string | null> => {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Habit Reminder',
          body: `Time for: ${habitTitle}`,
          data: { habitId, type: 'habit-reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Schedule habit reminder error:', error);
      return null;
    }
  },

  // Cancel a scheduled notification
  cancelNotification: async (notificationId: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  },

  // Send streak alert notification
  sendStreakAlert: async (streakDays: number): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Keep Your Streak!',
          body: `You're on a ${streakDays}-day streak! Don't break it now!`,
          data: { type: 'streak-alert' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
    } catch (error) {
      console.error('Send streak alert error:', error);
    }
  },

  // Send motivational notification
  sendMotivationalNotification: async (message: string): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Stay Motivated!',
          body: message,
          data: { type: 'motivational' },
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Send motivational notification error:', error);
    }
  },

  // Send achievement notification
  sendAchievementNotification: async (badgeName: string): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Achievement Unlocked!',
          body: `Congratulations! You earned: ${badgeName}`,
          data: { type: 'achievement' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Send achievement notification error:', error);
    }
  },

  // Send friend request notification
  sendFriendRequestNotification: async (friendName: string): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👥 New Friend Request',
          body: `${friendName} wants to connect with you!`,
          data: { type: 'friend-request' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Send friend request notification error:', error);
    }
  },

  // Cancel all notifications
  cancelAllNotifications: async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Cancel all notifications error:', error);
    }
  },

  // Get all scheduled notifications
  getAllScheduledNotifications: async (): Promise<Notifications.NotificationRequest[]> => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Get all scheduled notifications error:', error);
      return [];
    }
  },
};
