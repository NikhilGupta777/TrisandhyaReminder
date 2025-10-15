import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AlarmSettings, AlarmSound } from "@shared/schema";

export type AlarmType = "pratah" | "madhyahna" | "sayam";

interface ActiveAlarm {
  type: AlarmType;
  time: string;
  sound: AlarmSound | undefined;
}

export function useAlarmMonitor() {
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const triggeredTodayRef = useRef<Set<string>>(new Set());
  const activeAlarmRef = useRef<ActiveAlarm | null>(null);

  const { data: settings } = useQuery<AlarmSettings>({
    queryKey: ["/api/alarm-settings"],
  });

  const { data: alarmSounds = [] } = useQuery<AlarmSound[]>({
    queryKey: ["/api/alarm-sounds"],
  });

  // Keep refs in sync with state
  useEffect(() => {
    activeAlarmRef.current = activeAlarm;
  }, [activeAlarm]);

  useEffect(() => {
    if (!settings) return;

    const checkAlarms = () => {
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
          const sound = alarmSounds.find(s => s.id === settings.alarmSoundId) || alarmSounds.find(s => s.isDefault);
          
          const newAlarm = {
            type: alarm.type,
            time: alarm.time,
            sound,
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
  }, [settings, alarmSounds]);

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };

  const snoozeAlarm = () => {
    // Snooze for 5 minutes - remove from triggered so it can trigger again
    if (activeAlarmRef.current) {
      const alarmKey = `${new Date().toDateString()}-${activeAlarmRef.current.type}`;
      triggeredTodayRef.current.delete(alarmKey);
    }
    setActiveAlarm(null);
  };

  return {
    activeAlarm,
    dismissAlarm,
    snoozeAlarm,
    volume: settings?.volume || 80,
  };
}
