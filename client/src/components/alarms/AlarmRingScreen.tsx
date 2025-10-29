import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Clock, Power } from 'lucide-react';
import type { IndexedDBAlarm } from '@/lib/indexedDBAlarmStorage';

interface AlarmRingScreenProps {
  alarm: IndexedDBAlarm;
  onDismiss: () => void;
  onSnooze: (customMinutes?: number) => void;
}

export function AlarmRingScreen({ alarm, onDismiss, onSnooze }: AlarmRingScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseScale, setPulseScale] = useState(1);
  const [dismissHoldProgress, setDismissHoldProgress] = useState(0);
  const [showSnoozeCustom, setShowSnoozeCustom] = useState(false);
  const [customSnoozeMinutes, setCustomSnoozeMinutes] = useState(alarm.snoozeMinutes);
  const dismissTimerRef = useRef<number | null>(null);
  const dismissIntervalRef = useRef<number | null>(null);
  const snoozeTimerRef = useRef<number | null>(null);

  // Memoize particle positions to prevent re-randomization on every render
  const particles = useRef(
    [...Array(20)].map(() => ({
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }))
  ).current;

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
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (dismissIntervalRef.current) clearInterval(dismissIntervalRef.current);
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDismissStart = () => {
    // Reset progress
    setDismissHoldProgress(0);
    
    // Start progress animation
    dismissIntervalRef.current = window.setInterval(() => {
      setDismissHoldProgress(prev => {
        const newProgress = prev + (100 / 20); // 20 intervals over 2 seconds
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Auto-dismiss after 2 seconds
    dismissTimerRef.current = window.setTimeout(() => {
      onDismiss();
    }, 2000);
  };

  const handleDismissEnd = () => {
    // Clear timers
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (dismissIntervalRef.current) {
      clearInterval(dismissIntervalRef.current);
      dismissIntervalRef.current = null;
    }
    
    // Reset progress
    setDismissHoldProgress(0);
  };

  const handleSnoozeStart = () => {
    snoozeTimerRef.current = window.setTimeout(() => {
      setShowSnoozeCustom(true);
    }, 1000);
  };

  const handleSnoozeEnd = () => {
    if (snoozeTimerRef.current) {
      clearTimeout(snoozeTimerRef.current);
      snoozeTimerRef.current = null;
    }
  };

  const handleSnoozeClick = () => {
    handleSnoozeEnd();
    onSnooze();
  };

  const handleCustomSnooze = () => {
    onSnooze(customSnoozeMinutes);
    setShowSnoozeCustom(false);
  };

  return (
    <>
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex flex-col items-center justify-between p-8 animate-in fade-in duration-500">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute bg-orange-500/10 rounded-full animate-float"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Top - Current Time */}
      <div className="text-center pt-12 animate-in slide-in-from-top duration-700 relative z-10">
        <p className="text-white/50 text-sm mb-2">Now</p>
        <h1 className="text-white text-6xl font-extralight tabular-nums tracking-tight">
          {formattedTime}
        </h1>
      </div>

      {/* Center - Alarm Icon and Info */}
      <div className="flex flex-col items-center justify-center flex-1 space-y-6 relative z-10">
        {/* Pulsing Bell Icon with enhanced animations */}
        <div
          className="relative animate-in zoom-in duration-500"
          style={{
            transform: `scale(${pulseScale})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 animate-ping">
            <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-150" />
          </div>
          <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full animate-pulse" />
          
          {/* Icon container */}
          <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-12 rounded-full shadow-2xl shadow-orange-500/50">
            <Bell className="h-24 w-24 text-white animate-bounce" style={{ animationDuration: '2s' }} />
          </div>

          {/* Rotating ring */}
          <div className="absolute inset-0 border-4 border-orange-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Alarm Info with staggered animations */}
        <div className="text-center space-y-2 animate-in slide-in-from-bottom duration-700 delay-200">
          <h2 className="text-4xl font-light text-white animate-in fade-in duration-500 delay-300">
            {alarm.label || 'Alarm'}
          </h2>
          <div className="flex items-center justify-center gap-2 text-white/60 animate-in fade-in duration-500 delay-500">
            <Clock className="h-4 w-4" />
            <span className="text-lg tabular-nums">{alarm.time}</span>
          </div>
          <p className="text-sm text-white/40 mt-4 animate-in fade-in duration-500 delay-700">
            {alarm.toneName}
          </p>
          {alarm.fadeInDuration > 0 && (
            <p className="text-xs text-orange-400/60 animate-in fade-in duration-500 delay-1000">
              Volume fading in over {alarm.fadeInDuration}s
            </p>
          )}
        </div>
      </div>

      {/* Bottom - Action Buttons */}
      <div className="w-full max-w-md space-y-4 pb-8 relative z-10 animate-in slide-in-from-bottom duration-700 delay-300">
        {/* Snooze Button */}
        <Button
          onClick={handleSnoozeClick}
          onMouseDown={handleSnoozeStart}
          onMouseUp={handleSnoozeEnd}
          onMouseLeave={handleSnoozeEnd}
          onTouchStart={handleSnoozeStart}
          onTouchEnd={handleSnoozeEnd}
          size="lg"
          variant="outline"
          className="w-full h-16 text-lg font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-2xl transition-all active:scale-95"
          data-testid="button-snooze-alarm"
        >
          Snooze {alarm.snoozeMinutes} min
          <span className="text-xs opacity-60 ml-2">(Hold for custom)</span>
        </Button>

        {/* Dismiss Button - Long Press Required */}
        <div className="relative">
          <Button
            onMouseDown={handleDismissStart}
            onMouseUp={handleDismissEnd}
            onMouseLeave={handleDismissEnd}
            onTouchStart={handleDismissStart}
            onTouchEnd={handleDismissEnd}
            size="lg"
            className="w-full h-16 text-lg font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 overflow-hidden relative"
            data-testid="button-dismiss-alarm"
          >
            {/* Progress indicator */}
            <div
              className="absolute inset-0 bg-white/30 transition-all duration-100"
              style={{
                width: `${dismissHoldProgress}%`,
                left: 0,
              }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Power className="h-5 w-5" />
              Hold to Dismiss
            </span>
          </Button>
        </div>

        <p className="text-center text-white/40 text-sm">
          Hold dismiss button for 2 seconds
        </p>
      </div>
    </div>

    {/* Custom Snooze Dialog */}
    <Dialog open={showSnoozeCustom} onOpenChange={setShowSnoozeCustom}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-900 text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">Custom Snooze</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Snooze duration (minutes)</Label>
            <Input
              type="number"
              value={customSnoozeMinutes}
              onChange={(e) => setCustomSnoozeMinutes(Number(e.target.value))}
              min={1}
              max={60}
              className="text-3xl font-light h-16 text-center bg-white/5 border-white/10 text-white tabular-nums"
              data-testid="input-custom-snooze"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSnoozeCustom(false)}
              variant="outline"
              className="flex-1 bg-transparent border-white/10 text-white/70 hover:bg-white/5"
              data-testid="button-cancel-custom-snooze"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomSnooze}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-apply-custom-snooze"
            >
              Snooze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
