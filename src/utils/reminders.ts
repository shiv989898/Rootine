import { format, formatDistanceToNow } from 'date-fns';
import { Habit } from '@/types';
import { ALL_REMINDER_DAYS } from '@/constants/reminders';

const MINUTES_IN_MS = 60 * 1000;

const parseReminderTime = (reminderTime?: string | null): { hour: number; minute: number } | null => {
  if (!reminderTime) {
    return null;
  }

  const [hourString, minuteString] = reminderTime.split(':');
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return { hour, minute };
};

export interface ReminderConfig {
  reminderEnabled: boolean;
  reminderTime?: string | null;
  reminderDays?: number[];
  reminderLeadMinutes?: number | null;
}

export const computeNextReminderDateFromConfig = (
  config: ReminderConfig,
  reference: Date = new Date()
): Date | null => {
  if (!config.reminderEnabled) {
    return null;
  }

  const timeParts = parseReminderTime(config.reminderTime);
  if (!timeParts) {
    return null;
  }

  const { hour, minute } = timeParts;
  const leadMinutes = config.reminderLeadMinutes ?? 0;
  const reminderDays = (config.reminderDays?.length ? config.reminderDays : ALL_REMINDER_DAYS).slice();

  if (!reminderDays.length) {
    return null;
  }

  const normalizedDays = reminderDays.map((day) => ((day % 7) + 7) % 7);

  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const candidate = new Date(reference);
    candidate.setHours(0, 0, 0, 0);
    candidate.setDate(reference.getDate() + dayOffset);

    if (!normalizedDays.includes(candidate.getDay())) {
      continue;
    }

    candidate.setHours(hour, minute, 0, 0);
    const candidateWithLead = new Date(candidate.getTime() - leadMinutes * MINUTES_IN_MS);

    if (candidateWithLead > reference) {
      return candidateWithLead;
    }
  }

  return null;
};

export const computeNextReminderDate = (habit: Habit, reference: Date = new Date()): Date | null =>
  computeNextReminderDateFromConfig(
    {
      reminderEnabled: habit.reminderEnabled,
      reminderTime: habit.reminderTime,
      reminderDays: habit.reminderDays,
      reminderLeadMinutes: habit.reminderLeadMinutes,
    },
    reference,
  );

export const formatReminderDateTime = (date: Date): string =>
  format(date, "eee, MMM d 'at' h:mm a");

export const formatReminderRelativeTime = (date: Date): string =>
  formatDistanceToNow(date, { addSuffix: true });
