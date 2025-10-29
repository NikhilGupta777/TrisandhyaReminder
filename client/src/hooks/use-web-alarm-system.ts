// React hook for managing the web alarm system
import { useState, useEffect, useCallback } from 'react';
import { indexedDBAlarmStorage, type IndexedDBAlarm } from '@/lib/indexedDBAlarmStorage';
import { webAlarmScheduler } from '@/lib/webAlarmScheduler';
import { alarmAudioPlayer } from '@/lib/alarmAudioPlayer';

interface AlarmSystemState {
  alarms: IndexedDBAlarm[];
  activeAlarm: IndexedDBAlarm | null;
  isInitialized: boolean;
  hasPermission: boolean;
}

export function useWebAlarmSystem() {
  const [state, setState] = useState<AlarmSystemState>({
    alarms: [],
    activeAlarm: null,
    isInitialized: false,
    hasPermission: false,
  });

  const loadAlarms = useCallback(async () => {
    try {
      const alarms = await indexedDBAlarmStorage.getAllAlarms();
      setState(prev => ({ ...prev, alarms }));
    } catch (error) {
      console.error('Failed to load alarms:', error);
    }
  }, []);

  const handleAlarmTrigger = useCallback(async (alarm: IndexedDBAlarm) => {
    setState(prev => ({ ...prev, activeAlarm: alarm }));
    
    // Load custom tone if one is selected
    let audioSource = null;
    if (alarm.toneId && !alarm.toneId.startsWith('default') && !alarm.toneId.startsWith('gentle') && !alarm.toneId.startsWith('classic')) {
      try {
        const customTone = await indexedDBAlarmStorage.getCustomTone(alarm.toneId);
        if (customTone) {
          audioSource = customTone.dataUrl;
        }
      } catch (error) {
        console.error('Failed to load custom tone:', error);
      }
    }
    
    // Play alarm sound with fade-in
    alarmAudioPlayer.playAlarmSound(
      audioSource,
      alarm.volume,
      alarm.vibrate,
      alarm.fadeInDuration
    );
  }, []);

  useEffect(() => {
    const initSystem = async () => {
      try {
        // Initialize alarm system
        const hasPermission = await webAlarmScheduler.initialize(handleAlarmTrigger);
        
        setState(prev => ({
          ...prev,
          isInitialized: true,
          hasPermission,
        }));

        // Load alarms
        await loadAlarms();
      } catch (error) {
        console.error('Failed to initialize alarm system:', error);
      }
    };

    initSystem();

    return () => {
      webAlarmScheduler.cleanup();
    };
  }, [handleAlarmTrigger, loadAlarms]);

  const createAlarm = useCallback(async (alarmData: Omit<IndexedDBAlarm, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAlarm = await indexedDBAlarmStorage.createAlarm(alarmData);
      if (newAlarm.enabled) {
        await webAlarmScheduler.scheduleAlarm(newAlarm);
      }
      await loadAlarms();
      return newAlarm;
    } catch (error) {
      console.error('Failed to create alarm:', error);
      throw error;
    }
  }, [loadAlarms]);

  const updateAlarm = useCallback(async (id: string, updates: Partial<IndexedDBAlarm>) => {
    try {
      await indexedDBAlarmStorage.updateAlarm(id, updates);
      
      const updatedAlarm = await indexedDBAlarmStorage.getAlarm(id);
      if (updatedAlarm) {
        if (updatedAlarm.enabled) {
          await webAlarmScheduler.scheduleAlarm(updatedAlarm);
        } else {
          await webAlarmScheduler.cancelAlarm(id);
        }
      }
      
      await loadAlarms();
    } catch (error) {
      console.error('Failed to update alarm:', error);
      throw error;
    }
  }, [loadAlarms]);

  const deleteAlarm = useCallback(async (id: string) => {
    try {
      await webAlarmScheduler.cancelAlarm(id);
      await indexedDBAlarmStorage.deleteAlarm(id);
      await loadAlarms();
    } catch (error) {
      console.error('Failed to delete alarm:', error);
      throw error;
    }
  }, [loadAlarms]);

  const toggleAlarm = useCallback(async (id: string, enabled: boolean) => {
    await updateAlarm(id, { enabled });
  }, [updateAlarm]);

  const dismissAlarm = useCallback(async () => {
    if (!state.activeAlarm) return;
    
    await alarmAudioPlayer.stopAlarmSound();
    await webAlarmScheduler.dismissAlarm(state.activeAlarm.id);
    setState(prev => ({ ...prev, activeAlarm: null }));
  }, [state.activeAlarm]);

  const snoozeAlarm = useCallback(async (customMinutes?: number) => {
    if (!state.activeAlarm) return;
    
    await alarmAudioPlayer.stopAlarmSound();
    const snoozeMinutes = customMinutes || state.activeAlarm.snoozeMinutes;
    await webAlarmScheduler.snoozeAlarm(state.activeAlarm.id, snoozeMinutes);
    setState(prev => ({ ...prev, activeAlarm: null }));
  }, [state.activeAlarm]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, hasPermission: permission === 'granted' }));
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    ...state,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissAlarm,
    snoozeAlarm,
    requestPermission,
    refreshAlarms: loadAlarms,
  };
}
