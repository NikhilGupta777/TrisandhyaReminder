import { useState, useEffect, useRef } from "react";
import { 
  getLocalAlarmSettings, 
  getAllAvailableAlarmSounds,
  getAlarmSoundById,
  type CustomAlarmSound 
} from "@/lib/alarmStorage";
import type { AlarmSound } from "@shared/schema";

export type AlarmType = "pratah" | "madhyahna" | "sayam";

interface ActiveAlarm {
  type: AlarmType;
  time: string;
  sound: AlarmSound | CustomAlarmSound | undefined;
  volume: number;
}

export function useAlarmMonitor() {
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const triggeredTodayRef = useRef<Set<string>>(new Set());
  const activeAlarmRef = useRef<ActiveAlarm | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    activeAlarmRef.current = activeAlarm;
  }, [activeAlarm]);

  useEffect(() => {
    const checkAlarms = () => {
      // Get fresh settings from localStorage each time
      const settings = getLocalAlarmSettings();
      const alarmSounds = getAllAvailableAlarmSounds();
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const today = now.toDateString();

      // Reset triggered alarms at midnight
      const lastCheckDate = localStorage.getItem("lastAlarmCheck");
      if (lastCheckDate !== today) {
        triggeredTodayRef.current = new Set();
        localStorage.setItem("lastAlarmCheck", today);
      }

      const alarms: Array<{ type: AlarmType; enabled: boolean; time: string }> = [
        { type: "pratah", enabled: settings.pratahEnabled, time: settings.pratahTime },
        { type: "madhyahna", enabled: settings.madhyahnaEnabled, time: settings.madhyahnaTime },
        { type: "sayam", enabled: settings.sayamEnabled, time: settings.sayamTime },
      ];

      for (const alarm of alarms) {
        const alarmKey = `${today}-${alarm.type}`;
        
        if (
          alarm.enabled &&
          alarm.time === currentTime &&
          !triggeredTodayRef.current.has(alarmKey) &&
          !activeAlarmRef.current
        ) {
          const sound = getAlarmSoundById(settings.alarmSoundId || '') || alarmSounds.find(s => 'isDefault' in s && s.isDefault);
          
          const newAlarm = {
            type: alarm.type,
            time: alarm.time,
            sound,
            volume: settings.volume,
          };
          
          setActiveAlarm(newAlarm);
          triggeredTodayRef.current.add(alarmKey);
          break;
        }
      }
    };

    // Check immediately
    checkAlarms();

    // Then check every 30 seconds
    const interval = setInterval(checkAlarms, 30000);

    return () => clearInterval(interval);
  }, []); // Empty deps - we check local storage on each interval

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };

  const snoozeAlarm = () => {
    if (!activeAlarm) return;
    
    // Clear current alarm
    setActiveAlarm(null);
    
    // Set a timeout to re-trigger the alarm in 5 minutes
    setTimeout(() => {
      // Get fresh settings
      const settings = getLocalAlarmSettings();
      const sound = getAlarmSoundById(settings.alarmSoundId || '');
      
      if (sound) {
        setActiveAlarm({
          ...activeAlarm,
          sound,
          volume: settings.volume,
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  return {
    activeAlarm,
    dismissAlarm,
    snoozeAlarm,
    volume: activeAlarm?.volume || 80,
  };
}
