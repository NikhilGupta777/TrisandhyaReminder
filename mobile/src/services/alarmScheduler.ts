import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import type { Alarm } from '../types/alarm';
import { database } from '../database/database';

const ALARM_TASK_NAME = 'ALARM_BACKGROUND_TASK';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // We'll handle sound manually for custom tones
    shouldSetBadge: false,
  }),
});

class AlarmScheduler {
  private activeSound: Audio.Sound | null = null;

  async initialize() {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Notification permissions not granted');
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    // Set up audio mode for alarms
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    // Alarm scheduler initialized
  }

  async scheduleAlarm(alarm: Alarm) {
    if (!alarm.enabled) return;

    // Cancel existing notifications for this alarm
    await this.cancelAlarm(alarm.id);

    const nextOccurrences = this.getNextOccurrences(alarm, 7); // Schedule next 7 occurrences

    for (const occurrence of nextOccurrences) {
      const trigger = new Date(occurrence);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.label || 'Alarm',
          body: `Time for ${alarm.label}`,
          sound: false, // We'll handle sound manually
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'alarm',
          data: {
            alarmId: alarm.id,
            toneUri: alarm.toneUri,
            toneName: alarm.toneName,
            volume: alarm.volume,
            vibrate: alarm.vibrate,
            snoozeMinutes: alarm.snoozeMinutes,
          },
        },
        trigger: { date: trigger } as any,
        identifier: `${alarm.id}_${occurrence}`,
      });
    }

    // Scheduled occurrences for alarm
  }

  async cancelAlarm(alarmId: string) {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const alarmNotifications = scheduledNotifications.filter(
      notif => notif.identifier.startsWith(alarmId)
    );

    for (const notif of alarmNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    console.log(`Cancelled ${alarmNotifications.length} notifications for alarm ${alarmId}`);
  }

  async rescheduleAllAlarms() {
    const alarms = await database.getEnabledAlarms();
    
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Reschedule each alarm
    for (const alarm of alarms) {
      await this.scheduleAlarm(alarm);
    }

    // Alarms rescheduled
  }

  async playAlarmSound(toneUri: string | null, volume: number, vibrate: boolean) {
    try {
      // Stop any currently playing sound
      if (this.activeSound) {
        await this.activeSound.stopAsync();
        await this.activeSound.unloadAsync();
      }

      // Play alarm sound
      const soundUri = toneUri || require('../assets/sounds/default-alarm.mp3');
      const { sound } = await Audio.Sound.createAsync(
        typeof soundUri === 'string' ? { uri: soundUri } : soundUri,
        { 
          shouldPlay: true, 
          volume: volume / 100,
          isLooping: true,
        }
      );

      this.activeSound = sound;

      // Vibrate if enabled
      if (vibrate) {
        this.startVibration();
      }

      console.log('Alarm sound playing');
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
      // Fallback to system notification sound
    }
  }

  async stopAlarmSound() {
    if (this.activeSound) {
      await this.activeSound.stopAsync();
      await this.activeSound.unloadAsync();
      this.activeSound = null;
    }
    this.stopVibration();
    console.log('Alarm sound stopped');
  }

  private vibrationInterval: NodeJS.Timeout | null = null;

  private startVibration() {
    this.vibrationInterval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1000);
  }

  private stopVibration() {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
  }

  async snoozeAlarm(alarmId: string, snoozeMinutes: number) {
    const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Snoozed Alarm',
        body: `Alarm will ring again in ${snoozeMinutes} minutes`,
        sound: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { alarmId, snoozed: true },
      },
      trigger: { date: snoozeTime } as any,
      identifier: `${alarmId}_snooze_${Date.now()}`,
    });

    console.log(`Alarm ${alarmId} snoozed for ${snoozeMinutes} minutes`);
  }

  // Calculate next alarm occurrences based on repeat days
  private getNextOccurrences(alarm: Alarm, count: number): number[] {
    const occurrences: number[] = [];
    const [hours, minutes] = alarm.time.split(':').map(Number);
    const now = new Date();

    if (alarm.repeatDays.length === 0) {
      // One-time alarm
      const alarmTime = new Date();
      alarmTime.setHours(hours, minutes, 0, 0);
      
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }
      
      occurrences.push(alarmTime.getTime());
    } else {
      // Repeating alarm
      let currentDate = new Date();
      currentDate.setHours(hours, minutes, 0, 0);

      while (occurrences.length < count) {
        const dayOfWeek = currentDate.getDay();
        
        if (alarm.repeatDays.includes(dayOfWeek) && currentDate > now) {
          occurrences.push(currentDate.getTime());
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return occurrences;
  }

  async getUpcomingAlarms(): Promise<Array<{ alarm: Alarm; nextRing: Date }>> {
    const alarms = await database.getEnabledAlarms();
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    return alarms.map(alarm => {
      const alarmNotifications = scheduledNotifications
        .filter(notif => notif.identifier.startsWith(alarm.id))
        .sort((a, b) => {
          const aTime = a.trigger && 'date' in a.trigger ? (a.trigger.date as number) : 0;
          const bTime = b.trigger && 'date' in b.trigger ? (b.trigger.date as number) : 0;
          return aTime - bTime;
        });

      const nextNotif = alarmNotifications[0];
      const nextRing = nextNotif && nextNotif.trigger && 'date' in nextNotif.trigger
        ? new Date(nextNotif.trigger.date as number)
        : new Date(0);

      return { alarm, nextRing };
    }).sort((a, b) => a.nextRing.getTime() - b.nextRing.getTime());
  }
}

export const alarmScheduler = new AlarmScheduler();

// Define background task for handling alarms when app is closed
TaskManager.defineTask(ALARM_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Alarm task error:', error);
    return;
  }

  console.log('Background alarm task triggered');
  // Handle alarm in background
});
