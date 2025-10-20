export interface Alarm {
  id: string;
  label: string;
  time: string; // HH:MM format
  enabled: boolean;
  repeatDays: number[]; // 0-6 (Sunday-Saturday)
  toneUri: string | null; // Local file URI or null for default
  toneName: string;
  volume: number; // 0-100
  vibrate: boolean;
  snoozeMinutes: number;
  createdAt: number;
  updatedAt: number;
}

export interface AlarmInstance {
  id: string;
  alarmId: string;
  scheduledTime: number; // Unix timestamp
  triggered: boolean;
  snoozed: boolean;
  dismissed: boolean;
}

export interface CustomTone {
  id: string;
  name: string;
  uri: string;
  duration: number;
  fileSize: number;
  createdAt: number;
}

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEK_DAYS = [
  { id: 0, label: 'Sun', fullLabel: 'Sunday' },
  { id: 1, label: 'Mon', fullLabel: 'Monday' },
  { id: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { id: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { id: 4, label: 'Thu', fullLabel: 'Thursday' },
  { id: 5, label: 'Fri', fullLabel: 'Friday' },
  { id: 6, label: 'Sat', fullLabel: 'Saturday' },
] as const;
