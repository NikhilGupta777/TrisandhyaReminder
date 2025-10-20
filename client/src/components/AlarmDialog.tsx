import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Bell, Clock, AlarmClock, X } from "lucide-react";
import type { AlarmType } from "@/hooks/use-alarm-monitor";
import type { AlarmSound } from "@shared/schema";
import type { CustomAlarmSound } from "@/lib/alarmStorage";

interface AlarmDialogProps {
  isOpen: boolean;
  alarmType: AlarmType;
  alarmTime: string;
  alarmSound: AlarmSound | CustomAlarmSound | undefined;
  volume: number;
  onDismiss: () => void;
  onSnooze: () => void;
}

const alarmNames = {
  pratah: "Pratah Sandhya",
  madhyahna: "Madhyahna Sandhya",
  sayam: "Sayam Sandhya",
};

export function AlarmDialog({
  isOpen,
  alarmType,
  alarmTime,
  alarmSound,
  volume,
  onDismiss,
  onSnooze,
}: AlarmDialogProps) {
  const [audio] = useState(() => new Audio());

  useEffect(() => {
    if (isOpen && alarmSound) {
      // Get the audio source - either from URL or dataUrl (custom sound)
      const soundUrl = 'dataUrl' in alarmSound ? alarmSound.dataUrl : alarmSound.url;
      
      if (!soundUrl || soundUrl === '') {
        // For default sounds without URLs, use a beep tone
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';
        gainNode.gain.value = volume / 100;
        
        oscillator.start();
        
        // Loop the beep every 2 seconds
        const beepInterval = setInterval(() => {
          if (audioContext.state === 'running') {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 440;
            osc.type = 'sine';
            gain.gain.value = volume / 100;
            osc.start();
            osc.stop(audioContext.currentTime + 0.5);
          }
        }, 2000);
        
        return () => {
          clearInterval(beepInterval);
          oscillator.stop();
          audioContext.close();
        };
      }
      
      audio.src = soundUrl;
      audio.loop = true;
      audio.volume = volume / 100;
      
      audio.play().catch((error) => {
        console.error("Failed to play alarm sound:", error);
      });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isOpen, alarmSound, volume, audio]);

  const handleDismiss = () => {
    audio.pause();
    audio.currentTime = 0;
    onDismiss();
  };

  const handleSnooze = () => {
    audio.pause();
    audio.currentTime = 0;
    onSnooze();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md" data-testid="alarm-dialog">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-6 animate-pulse">
              <Bell className="h-12 w-12 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            {alarmNames[alarmType]}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
              <Clock className="h-5 w-5" />
              <span>{alarmTime}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              It's time for your {alarmNames[alarmType].toLowerCase()} practice
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-col gap-2">
          <Button
            onClick={handleSnooze}
            variant="outline"
            className="w-full"
            data-testid="button-snooze-alarm"
          >
            <AlarmClock className="h-4 w-4 mr-2" />
            Snooze (5 min)
          </Button>
          <Button
            onClick={handleDismiss}
            className="w-full"
            data-testid="button-dismiss-alarm"
          >
            <X className="h-4 w-4 mr-2" />
            Dismiss
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
