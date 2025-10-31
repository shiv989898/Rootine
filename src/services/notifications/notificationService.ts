import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSoundPreference } from '@/types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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
 * Helper to normalize reminder time with lead offset
 */
const calculateReminderTime = (
  hour: number,
  minute: number,
  leadMinutes: number
) => {
  const totalMinutes = hour * 60 + minute - leadMinutes;
  if (totalMinutes >= 0) {
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
      dayOffset: 0,
    };
  }

  const minutesInDay = 24 * 60;
  const adjustedMinutes = (totalMinutes % minutesInDay + minutesInDay) % minutesInDay;
  const dayOffset = Math.floor((totalMinutes - adjustedMinutes) / minutesInDay);

  return {
    hour: Math.floor(adjustedMinutes / 60),
    minute: adjustedMinutes % 60,
    dayOffset,
  };
};

const toExpoWeekday = (day: number) => {
  // Expo uses 1 = Sunday ... 7 = Saturday
  return ((day % 7) + 7) % 7 + 1;
};

interface HabitReminderScheduleOptions {
  habitId: string;
  habitTitle: string;
  hour: number;
  minute: number;
  days: number[];
  leadMinutes?: number;
  existingNotificationIds?: string[];
  soundPreference?: NotificationSoundPreference;
}

const configureHabitReminderChannel = async (soundPref?: NotificationSoundPreference) => {
  if (Platform.OS !== 'android') {
    return;
  }

  const channelSound =
    soundPref?.type === 'bundle' && soundPref.bundleAsset
      ? soundPref.bundleAsset
      : 'default';

  await Notifications.setNotificationChannelAsync('habit-reminders', {
    name: 'Habit Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4CAF50',
    sound: channelSound,
  });
};

const resolveNotificationSound = (soundPref?: NotificationSoundPreference): string => {
  if (!soundPref || soundPref.type === 'default') {
    return 'default';
  }

  if (soundPref.type === 'bundle' && soundPref.bundleAsset) {
    return soundPref.bundleAsset;
  }

  if (soundPref.type === 'uploaded') {
    // Custom runtime uploads require native integration; fall back to default sound until bundled
    return 'default';
  }

  return 'default';
};

/**
 * Schedule notifications for a habit reminder across selected days
 */
export const scheduleHabitReminder = async ({
  habitId,
  habitTitle,
  hour,
  minute,
  days,
  leadMinutes = 0,
  existingNotificationIds = [],
  soundPreference,
}: HabitReminderScheduleOptions): Promise<string[]> => {
  try {
    if (!days.length) {
      return [];
    }

    if (existingNotificationIds.length) {
      await cancelHabitReminder(existingNotificationIds);
    }

    await configureHabitReminderChannel(soundPreference);
    const notificationSound = resolveNotificationSound(soundPreference);

    const normalizedDays = [...new Set(days)]
      .map((day) => ((day % 7) + 7) % 7)
      .sort((a, b) => a - b);
    const notificationIds: string[] = [];

    for (const day of normalizedDays) {
      const { hour: triggerHour, minute: triggerMinute, dayOffset } = calculateReminderTime(
        hour,
        minute,
        leadMinutes
      );

      const targetDay = (day + dayOffset + 7) % 7;
      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: toExpoWeekday(targetDay),
        hour: triggerHour,
        minute: triggerMinute,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${habitTitle}`,
          body:
            leadMinutes > 0
              ? `Starts in ${leadMinutes} minute${leadMinutes === 1 ? '' : 's'}.`
              : 'Time to work on this habit.',
          data: {
            habitId,
            type: 'habit-reminder',
            day: targetDay,
            originalDay: day,
            leadMinutes,
          },
          sound: notificationSound,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
        },
        trigger,
      });

      notificationIds.push(notificationId);
    }

    console.log(
      `Scheduled ${notificationIds.length} reminder(s) for ${habitTitle} at ${hour}:${minute} with lead ${leadMinutes} minutes`
    );

    return notificationIds;
  } catch (error) {
    console.error('Error scheduling habit reminder:', error);
    return [];
  }
};

/**
 * Cancel a scheduled habit reminder
 */
export const cancelHabitReminder = async (reminderIds: string[]): Promise<void> => {
  try {
    if (!reminderIds?.length) return;

    await Promise.all(
      reminderIds.map(async (id) => {
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
          console.log(`Cancelled reminder: ${id}`);
        } catch (innerError) {
          console.error(`Error cancelling reminder ${id}:`, innerError);
        }
      })
    );
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
