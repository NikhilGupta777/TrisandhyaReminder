// Web-based alarm storage using localStorage for offline support

export interface WebAlarm {
  id: string;
  label: string;
  time: string; // HH:MM format
  enabled: boolean;
  repeatDays: number[]; // 0-6 (Sunday-Saturday)
  toneName: string;
  toneId?: string;
  volume: number; // 0-100
  snoozeMinutes: number;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'trisandhya_web_alarms';

export class WebAlarmStorage {
  getAllAlarms(): WebAlarm[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load alarms:', error);
      return [];
    }
  }

  getAlarm(id: string): WebAlarm | null {
    const alarms = this.getAllAlarms();
    return alarms.find(a => a.id === id) || null;
  }

  createAlarm(alarm: Omit<WebAlarm, 'id' | 'createdAt' | 'updatedAt'>): WebAlarm {
    const newAlarm: WebAlarm = {
      ...alarm,
      id: `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const alarms = this.getAllAlarms();
    alarms.push(newAlarm);
    this.saveAlarms(alarms);
    return newAlarm;
  }

  updateAlarm(id: string, updates: Partial<WebAlarm>): void {
    const alarms = this.getAllAlarms();
    const index = alarms.findIndex(a => a.id === id);
    
    if (index !== -1) {
      alarms[index] = {
        ...alarms[index],
        ...updates,
        id: alarms[index].id, // Preserve ID
        createdAt: alarms[index].createdAt, // Preserve creation time
        updatedAt: Date.now(),
      };
      this.saveAlarms(alarms);
    }
  }

  deleteAlarm(id: string): void {
    const alarms = this.getAllAlarms();
    const filtered = alarms.filter(a => a.id !== id);
    this.saveAlarms(filtered);
  }

  private saveAlarms(alarms: WebAlarm[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch (error) {
      console.error('Failed to save alarms:', error);
    }
  }
}

export const webAlarmStorage = new WebAlarmStorage();
