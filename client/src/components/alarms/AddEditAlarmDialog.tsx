import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Trash2, Volume2, Bell } from 'lucide-react';
import { useWebAlarmSystem } from '@/hooks/use-web-alarm-system';
import type { IndexedDBAlarm } from '@/lib/indexedDBAlarmStorage';
import { useToast } from '@/hooks/use-toast';

const WEEK_DAYS = [
  { id: 0, label: 'S', fullLabel: 'Sunday' },
  { id: 1, label: 'M', fullLabel: 'Monday' },
  { id: 2, label: 'T', fullLabel: 'Tuesday' },
  { id: 3, label: 'W', fullLabel: 'Wednesday' },
  { id: 4, label: 'T', fullLabel: 'Thursday' },
  { id: 5, label: 'F', fullLabel: 'Friday' },
  { id: 6, label: 'S', fullLabel: 'Saturday' },
];

interface AddEditAlarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAlarm: IndexedDBAlarm | null;
  onClose: () => void;
  onDelete: (id: string, label: string) => void;
}

export function AddEditAlarmDialog({
  open,
  onOpenChange,
  editingAlarm,
  onClose,
  onDelete,
}: AddEditAlarmDialogProps) {
  const { toast } = useToast();
  const { createAlarm, updateAlarm } = useWebAlarmSystem();

  const [label, setLabel] = useState('');
  const [time, setTime] = useState('06:00');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [volume, setVolume] = useState([80]);
  const [vibrate, setVibrate] = useState(true);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);

  useEffect(() => {
    if (editingAlarm) {
      setLabel(editingAlarm.label);
      setTime(editingAlarm.time);
      setRepeatDays(editingAlarm.repeatDays);
      setVolume([editingAlarm.volume]);
      setVibrate(editingAlarm.vibrate);
      setSnoozeMinutes(editingAlarm.snoozeMinutes);
    } else {
      // Reset for new alarm
      setLabel('');
      setTime('06:00');
      setRepeatDays([]);
      setVolume([80]);
      setVibrate(true);
      setSnoozeMinutes(5);
    }
  }, [editingAlarm, open]);

  const toggleRepeatDay = (day: number) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    try {
      const alarmData = {
        label: label || 'Alarm',
        time,
        enabled: true,
        repeatDays,
        toneId: null,
        toneName: 'Default',
        volume: volume[0],
        vibrate,
        snoozeMinutes,
      };

      if (editingAlarm) {
        await updateAlarm(editingAlarm.id, alarmData);
        toast({ title: 'Alarm updated', duration: 2000 });
      } else {
        await createAlarm(alarmData);
        toast({ title: 'Alarm created', duration: 2000 });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save alarm',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = () => {
    if (editingAlarm) {
      onDelete(editingAlarm.id, editingAlarm.label);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 text-white border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-light">
              {editingAlarm ? 'Edit alarm' : 'Add alarm'}
            </DialogTitle>
            {editingAlarm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                data-testid="button-delete-alarm"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time Picker */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-5xl font-light h-24 text-center bg-white/5 border-white/10 text-white tabular-nums"
              data-testid="input-alarm-time"
            />
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Alarm"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              data-testid="input-alarm-label"
            />
          </div>

          {/* Repeat Days */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">Repeat</Label>
            <div className="flex gap-2 justify-between">
              {WEEK_DAYS.map(day => (
                <Button
                  key={day.id}
                  variant={repeatDays.includes(day.id) ? "default" : "outline"}
                  size="sm"
                  className={`w-11 h-11 p-0 rounded-full font-medium ${
                    repeatDays.includes(day.id)
                      ? 'bg-orange-500 hover:bg-orange-600 text-white border-0'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                  }`}
                  onClick={() => toggleRepeatDay(day.id)}
                  data-testid={`button-repeat-day-${day.id}`}
                >
                  {day.label}
                </Button>
              ))}
            </div>
            {repeatDays.length === 0 && (
              <p className="text-xs text-white/40">Alarm will ring once</p>
            )}
            {repeatDays.length === 7 && (
              <p className="text-xs text-orange-400">Every day</p>
            )}
          </div>

          {/* Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white/70 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Volume
              </Label>
              <span className="text-sm text-white/50">{volume[0]}%</span>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              min={0}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
              data-testid="slider-volume"
            />
          </div>

          {/* Vibrate */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Vibrate
            </Label>
            <Switch
              checked={vibrate}
              onCheckedChange={setVibrate}
              className="data-[state=checked]:bg-orange-500"
              data-testid="switch-vibrate"
            />
          </div>

          {/* Snooze Duration */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Snooze duration (minutes)</Label>
            <Input
              type="number"
              value={snoozeMinutes}
              onChange={(e) => setSnoozeMinutes(Number(e.target.value))}
              min={1}
              max={30}
              className="bg-white/5 border-white/10 text-white"
              data-testid="input-snooze-minutes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onClose()}
              variant="outline"
              className="flex-1 bg-transparent border-white/10 text-white/70 hover:bg-white/5"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-save-alarm"
            >
              {editingAlarm ? 'Save' : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
