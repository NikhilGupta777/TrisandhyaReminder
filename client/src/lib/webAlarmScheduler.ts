// Web-based alarm scheduler using Notifications API for reliable alarms
// Provides smartphone-level alarm triggering even when browser is minimized

import { indexedDBAlarmStorage, type IndexedDBAlarm } from './indexedDBAlarmStorage';

export type AlarmTriggerCallback = (alarm: IndexedDBAlarm) => void;

class WebAlarmScheduler {
  private checkInterval: number | null = null;
  private onAlarmTrigger: AlarmTriggerCallback | null = null;
  private triggeredToday = new Set<string>();
  private permissionGranted = false;

  async initialize(onTrigger: AlarmTriggerCallback): Promise<boolean> {
    this.onAlarmTrigger = onTrigger;

    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      
      if (!this.permissionGranted) {
        console.warn('Notification permission denied. Alarms will not trigger reliably.');
        return false;
      }
    } else {
      console.error('Notifications API not supported');
      return false;
    }

    // Initialize IndexedDB
    await indexedDBAlarmStorage.init();

    // Start monitoring alarms
    this.startMonitoring();

    // Reschedule all enabled alarms
    await this.rescheduleAllAlarms();

    return true;
  }

  private startMonitoring(): void {
    // Check for due alarms every 30 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkDueAlarms();
    }, 30000);

    // Also check immediately
    this.checkDueAlarms();

    // Reset triggered alarms at midnight
    this.scheduleMiddnightReset();
  }

  private scheduleMiddnightReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.triggeredToday.clear();
      localStorage.setItem('lastAlarmReset', new Date().toDateString());
      
      // Schedule next midnight reset
      this.scheduleMiddnightReset();
    }, msUntilMidnight);
  }

  private async checkDueAlarms(): Promise<void> {
    try {
      const alarms = await indexedDBAlarmStorage.getEnabledAlarms();
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay(); // 0-6
      const today = now.toDateString();

      for (const alarm of alarms) {
        const alarmKey = `${today}-${alarm.id}`;

        // Skip if already triggered today
        if (this.triggeredToday.has(alarmKey)) {
          continue;
        }

        // Check if alarm time matches
        if (alarm.time === currentTime) {
          // Check if today is in repeat days or if it's a one-time alarm
          const shouldTrigger = alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay);

          if (shouldTrigger) {
            this.triggerAlarm(alarm);
            this.triggeredToday.add(alarmKey);

            // If it's a one-time alarm, disable it
            if (alarm.repeatDays.length === 0) {
              await indexedDBAlarmStorage.updateAlarm(alarm.id, { enabled: false });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking due alarms:', error);
    }
  }

  private triggerAlarm(alarm: IndexedDBAlarm): void {
    // Show notification
    this.showNotification(alarm);

    // Call the trigger callback
    if (this.onAlarmTrigger) {
      this.onAlarmTrigger(alarm);
    }

    // Create alarm instance
    indexedDBAlarmStorage.createAlarmInstance({
      alarmId: alarm.id,
      scheduledTime: Date.now(),
      triggered: true,
      snoozed: false,
      dismissed: false,
    });
  }

  private showNotification(alarm: IndexedDBAlarm): void {
    if (!this.permissionGranted) return;

    const notification = new Notification(alarm.label || 'Alarm', {
      body: `It's time for ${alarm.label}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `alarm-${alarm.id}`,
      requireInteraction: true,
      silent: false,
      data: {
        alarmId: alarm.id,
        time: alarm.time,
      },
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  async scheduleAlarm(alarm: IndexedDBAlarm): Promise<void> {
    // In web environment, we rely on the interval check
    // Store in IndexedDB for persistence
    console.log('Alarm scheduled:', alarm.label, alarm.time);
  }

  async cancelAlarm(alarmId: string): Promise<void> {
    // Remove from triggered set
    const today = new Date().toDateString();
    const alarmKey = `${today}-${alarmId}`;
    this.triggeredToday.delete(alarmKey);
    
    console.log('Alarm cancelled:', alarmId);
  }

  async snoozeAlarm(alarmId: string, snoozeMinutes: number): Promise<void> {
    try {
      const alarm = await indexedDBAlarmStorage.getAlarm(alarmId);
      if (!alarm) return;

      // Calculate snooze time
      const now = new Date();
      const snoozeTime = new Date(now.getTime() + snoozeMinutes * 60 * 1000);
      const snoozeTimeStr = `${snoozeTime.getHours().toString().padStart(2, '0')}:${snoozeTime.getMinutes().toString().padStart(2, '0')}`;

      // Create a temporary one-time alarm for snooze
      await indexedDBAlarmStorage.createAlarm({
        label: `${alarm.label} (Snoozed)`,
        time: snoozeTimeStr,
        enabled: true,
        repeatDays: [], // One-time
        toneId: alarm.toneId,
        toneName: alarm.toneName,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeMinutes: alarm.snoozeMinutes,
      });

      // Update instance
      const instances = await indexedDBAlarmStorage.getAlarmInstances(alarmId);
      const latestInstance = instances[instances.length - 1];
      if (latestInstance) {
        await indexedDBAlarmStorage.updateAlarmInstance(latestInstance.id, {
          snoozed: true,
        });
      }

      console.log(`Alarm snoozed for ${snoozeMinutes} minutes`);
    } catch (error) {
      console.error('Failed to snooze alarm:', error);
    }
  }

  async dismissAlarm(alarmId: string): Promise<void> {
    try {
      // Update latest instance
      const instances = await indexedDBAlarmStorage.getAlarmInstances(alarmId);
      const latestInstance = instances[instances.length - 1];
      if (latestInstance) {
        await indexedDBAlarmStorage.updateAlarmInstance(latestInstance.id, {
          dismissed: true,
        });
      }

      console.log('Alarm dismissed:', alarmId);
    } catch (error) {
      console.error('Failed to dismiss alarm:', error);
    }
  }

  async rescheduleAllAlarms(): Promise<void> {
    try {
      const alarms = await indexedDBAlarmStorage.getEnabledAlarms();
      for (const alarm of alarms) {
        await this.scheduleAlarm(alarm);
      }
      console.log(`Rescheduled ${alarms.length} alarms`);
    } catch (error) {
      console.error('Failed to reschedule alarms:', error);
    }
  }

  getNextOccurrence(alarm: IndexedDBAlarm): Date | null {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    // If one-time alarm
    if (alarm.repeatDays.length === 0) {
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, it's for tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      return next;
    }

    // For repeating alarms, find next occurrence
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const alarmTime = hours * 60 + minutes;

    // Check if alarm is later today
    if (alarm.repeatDays.includes(currentDay) && alarmTime > currentTime) {
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      return next;
    }

    // Find next day in repeat days
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (alarm.repeatDays.includes(checkDay)) {
        const next = new Date();
        next.setDate(next.getDate() + i);
        next.setHours(hours, minutes, 0, 0);
        return next;
      }
    }

    return null;
  }

  cleanup(): void {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const webAlarmScheduler = new WebAlarmScheduler();
