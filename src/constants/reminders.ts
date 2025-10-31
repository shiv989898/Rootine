export const ALL_REMINDER_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const DAYS_OF_WEEK = [
  { id: 0, short: 'S', full: 'Sunday' },
  { id: 1, short: 'M', full: 'Monday' },
  { id: 2, short: 'T', full: 'Tuesday' },
  { id: 3, short: 'W', full: 'Wednesday' },
  { id: 4, short: 'T', full: 'Thursday' },
  { id: 5, short: 'F', full: 'Friday' },
  { id: 6, short: 'S', full: 'Saturday' },
];

export const DEFAULT_REMINDER_LEAD_MINUTES = 15;

export const LEAD_TIME_OPTIONS = [
  { label: 'At time', value: 0 },
  { label: '5 min before', value: 5 },
  { label: '10 min before', value: 10 },
  { label: '15 min before', value: 15 },
  { label: '30 min before', value: 30 },
  { label: '1 hour before', value: 60 },
];

export const getLeadTimeLabel = (value: number): string => {
  const option = LEAD_TIME_OPTIONS.find((item) => item.value === value);
  return option ? option.label : `${value} min before`;
};
