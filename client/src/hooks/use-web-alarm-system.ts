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

  const handleAlarmTrigger = useCallback((alarm: IndexedDBAlarm) => {
    setState(prev => ({ ...prev, activeAlarm: alarm }));
    
    // Play alarm sound
    alarmAudioPlayer.playAlarmSound(
      alarm.toneId ? `tone_${alarm.toneId}` : null,
      alarm.volume,
      alarm.vibrate
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

  const snoozeAlarm = useCallback(async () => {
    if (!state.activeAlarm) return;
    
    await alarmAudioPlayer.stopAlarmSound();
    await webAlarmScheduler.snoozeAlarm(state.activeAlarm.id, state.activeAlarm.snoozeMinutes);
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
