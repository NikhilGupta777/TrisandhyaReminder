import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Volume2, Bell, Upload, Play } from 'lucide-react';
import { useWebAlarmSystem } from '@/hooks/use-web-alarm-system';
import { indexedDBAlarmStorage, type IndexedDBAlarm, type CustomTone } from '@/lib/indexedDBAlarmStorage';
import { alarmAudioPlayer } from '@/lib/alarmAudioPlayer';
import type { IndexedDBAlarm as IndexedDBAlarmType } from '@/lib/indexedDBAlarmStorage';
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

const DEFAULT_TONES = [
  { id: 'default', name: 'Default Bell' },
  { id: 'gentle', name: 'Gentle Chime' },
  { id: 'classic', name: 'Classic Alarm' },
];

interface AddEditAlarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAlarm: IndexedDBAlarmType | null;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [label, setLabel] = useState('');
  const [time, setTime] = useState('06:00');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [volume, setVolume] = useState([80]);
  const [vibrate, setVibrate] = useState(true);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);
  const [selectedToneId, setSelectedToneId] = useState<string | null>(null);
  const [customTones, setCustomTones] = useState<CustomTone[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fadeInDuration, setFadeInDuration] = useState(30);
  const [enablePreAlarm, setEnablePreAlarm] = useState(false);
  const [preAlarmMinutes, setPreAlarmMinutes] = useState(30);

  useEffect(() => {
    if (open) {
      loadCustomTones();
    }
  }, [open]);

  useEffect(() => {
    if (editingAlarm) {
      setLabel(editingAlarm.label);
      setTime(editingAlarm.time);
      setRepeatDays(editingAlarm.repeatDays);
      setVolume([editingAlarm.volume]);
      setVibrate(editingAlarm.vibrate);
      setSnoozeMinutes(editingAlarm.snoozeMinutes);
      setSelectedToneId(editingAlarm.toneId);
      setFadeInDuration(editingAlarm.fadeInDuration);
      setEnablePreAlarm(editingAlarm.enablePreAlarm);
      setPreAlarmMinutes(editingAlarm.preAlarmMinutes);
    } else {
      setLabel('');
      setTime('06:00');
      setRepeatDays([]);
      setVolume([80]);
      setVibrate(true);
      setSnoozeMinutes(5);
      setSelectedToneId(null);
      setFadeInDuration(30);
      setEnablePreAlarm(false);
      setPreAlarmMinutes(30);
    }
  }, [editingAlarm, open]);

  const loadCustomTones = async () => {
    try {
      const tones = await indexedDBAlarmStorage.getAllCustomTones();
      setCustomTones(tones);
    } catch (error) {
      console.error('Failed to load custom tones:', error);
    }
  };

  const toggleRepeatDay = (day: number) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an audio file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an audio file (MP3, WAV, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const dataUrl = await fileToDataUrl(file);
      const tone = await indexedDBAlarmStorage.addCustomTone({
        name: file.name.replace(/\.[^/.]+$/, ''),
        dataUrl,
        duration: null,
        fileSize: file.size,
        mimeType: file.type,
      });

      await loadCustomTones();
      setSelectedToneId(tone.id);

      toast({
        title: 'Tone uploaded',
        description: `${file.name} has been added`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to upload tone:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload audio file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleTestTone = async () => {
    try {
      let audioSource = null;
      if (selectedToneId && !DEFAULT_TONES.find(t => t.id === selectedToneId)) {
        const tone = await indexedDBAlarmStorage.getCustomTone(selectedToneId);
        audioSource = tone?.dataUrl || null;
      }
      await alarmAudioPlayer.testSound(audioSource, volume[0]);
    } catch (error) {
      console.error('Failed to test tone:', error);
      toast({
        title: 'Test failed',
        description: 'Could not play alarm tone',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      const selectedTone = selectedToneId 
        ? (DEFAULT_TONES.find(t => t.id === selectedToneId) || 
           customTones.find(t => t.id === selectedToneId))
        : null;

      const alarmData = {
        label: label || 'Alarm',
        time,
        enabled: true,
        repeatDays,
        toneId: selectedToneId,
        toneName: selectedTone?.name || 'Default Bell',
        volume: volume[0],
        vibrate,
        snoozeMinutes,
        fadeInDuration,
        enablePreAlarm,
        preAlarmMinutes,
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

  const allTones = [...DEFAULT_TONES, ...customTones];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 text-white border-white/10 max-h-[90vh] overflow-y-auto">
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

          {/* Alarm Tone Selection */}
          <div className="space-y-3">
            <Label className="text-sm text-white/70">Alarm Tone</Label>
            <div className="flex gap-2">
              <Select value={selectedToneId || undefined} onValueChange={setSelectedToneId}>
                <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Default Bell" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {allTones.map(tone => (
                    <SelectItem 
                      key={tone.id} 
                      value={tone.id}
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      {tone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleTestTone}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                data-testid="button-test-tone"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Upload Custom Tone */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                data-testid="button-upload-tone"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Custom Tone'}
              </Button>
            </div>
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

          {/* Fade-in Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white/70">Volume fade-in (seconds)</Label>
              <span className="text-sm text-white/50">{fadeInDuration}s</span>
            </div>
            <Slider
              value={[fadeInDuration]}
              onValueChange={(val) => setFadeInDuration(val[0])}
              min={0}
              max={60}
              step={5}
              className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
              data-testid="slider-fade-in"
            />
            {fadeInDuration === 0 && (
              <p className="text-xs text-white/40">Instant full volume</p>
            )}
            {fadeInDuration > 0 && (
              <p className="text-xs text-orange-400">Gradually increases volume over {fadeInDuration}s</p>
            )}
          </div>

          {/* Pre-alarm */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-white/70">Pre-alarm (gentle wake)</Label>
                <p className="text-xs text-white/40 mt-1">Low volume alarm before main alarm</p>
              </div>
              <Switch
                checked={enablePreAlarm}
                onCheckedChange={setEnablePreAlarm}
                className="data-[state=checked]:bg-orange-500"
                data-testid="switch-pre-alarm"
              />
            </div>
            {enablePreAlarm && (
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Pre-alarm time (minutes before)</Label>
                <Input
                  type="number"
                  value={preAlarmMinutes}
                  onChange={(e) => setPreAlarmMinutes(Number(e.target.value))}
                  min={5}
                  max={60}
                  className="bg-white/5 border-white/10 text-white"
                  data-testid="input-pre-alarm-minutes"
                />
              </div>
            )}
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
