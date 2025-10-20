import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Clock } from 'lucide-react';
import type { IndexedDBAlarm } from '@/lib/indexedDBAlarmStorage';

interface AlarmRingScreenProps {
  alarm: IndexedDBAlarm;
  onDismiss: () => void;
  onSnooze: () => void;
}

export function AlarmRingScreen({ alarm, onDismiss, onSnooze }: AlarmRingScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Pulse animation
    const pulseInterval = setInterval(() => {
      setPulseScale(prev => (prev === 1 ? 1.15 : 1));
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex flex-col items-center justify-between p-8 animate-in fade-in duration-300">
      {/* Top - Current Time */}
      <div className="text-center pt-12">
        <p className="text-white/50 text-sm mb-2">Now</p>
        <h1 className="text-white text-6xl font-extralight tabular-nums tracking-tight">
          {formattedTime}
        </h1>
      </div>

      {/* Center - Alarm Icon and Info */}
      <div className="flex flex-col items-center justify-center flex-1 space-y-6">
        {/* Pulsing Bell Icon */}
        <div
          className="relative"
          style={{
            transform: `scale(${pulseScale})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full" />
          
          {/* Icon */}
          <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-12 rounded-full shadow-2xl shadow-orange-500/50">
            <Bell className="h-24 w-24 text-white" />
          </div>
        </div>

        {/* Alarm Info */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-light text-white">
            {alarm.label || 'Alarm'}
          </h2>
          <div className="flex items-center justify-center gap-2 text-white/60">
            <Clock className="h-4 w-4" />
            <span className="text-lg tabular-nums">{alarm.time}</span>
          </div>
          <p className="text-sm text-white/40 mt-4">
            {alarm.toneName}
          </p>
        </div>
      </div>

      {/* Bottom - Action Buttons */}
      <div className="w-full max-w-md space-y-4 pb-8">
        {/* Snooze Button */}
        <Button
          onClick={onSnooze}
          size="lg"
          variant="outline"
          className="w-full h-16 text-lg font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-2xl"
          data-testid="button-snooze-alarm"
        >
          Snooze {alarm.snoozeMinutes} min
        </Button>

        {/* Dismiss Button */}
        <Button
          onClick={onDismiss}
          size="lg"
          className="w-full h-16 text-lg font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg shadow-orange-500/30"
          data-testid="button-dismiss-alarm"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
