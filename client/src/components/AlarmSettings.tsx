import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Play, Pause, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getLocalAlarmSettings,
  saveLocalAlarmSettings,
  getAllAvailableAlarmSounds,
  addCustomAlarmSound,
  deleteCustomAlarmSound,
  type CustomAlarmSound,
} from "@/lib/alarmStorage";
import type { AlarmSound } from "@shared/schema";

export function AlarmSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(getLocalAlarmSettings());
  const [availableSounds, setAvailableSounds] = useState<(AlarmSound | CustomAlarmSound)[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load available sounds on mount
  useEffect(() => {
    setAvailableSounds(getAllAvailableAlarmSounds());
  }, []);

  const updateSettings = (updates: Partial<typeof settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveLocalAlarmSettings(newSettings);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an audio file (MP3, WAV, OGG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const customSound = await addCustomAlarmSound(file);
      setAvailableSounds(getAllAvailableAlarmSounds());
      toast({
        title: "Success!",
        description: `Added "${customSound.name}" to your alarm sounds`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to add custom alarm sound",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteSound = (soundId: string) => {
    if (!soundId.startsWith('custom-')) {
      toast({
        title: "Cannot Delete",
        description: "Default sounds cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    deleteCustomAlarmSound(soundId);
    setAvailableSounds(getAllAvailableAlarmSounds());
    
    // If deleted sound was selected, switch to default
    if (settings.alarmSoundId === soundId) {
      updateSettings({ alarmSoundId: 'default-bell' });
    }

    toast({
      title: "Deleted",
      description: "Custom alarm sound removed",
    });
  };

  const handlePlaySound = (sound: AlarmSound | CustomAlarmSound) => {
    if (isPlaying === sound.id) {
      audioRef.current?.pause();
      setIsPlaying(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio();
    const soundUrl = 'dataUrl' in sound ? sound.dataUrl : sound.url;
    
    if (!soundUrl || soundUrl === '') {
      // For default sounds without URLs, use a beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // A4 note
      oscillator.type = 'sine';
      gainNode.gain.value = settings.volume / 100;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        setIsPlaying(null);
      }, 2000);
      
      setIsPlaying(sound.id);
      return;
    }

    audio.src = soundUrl;
    audio.volume = settings.volume / 100;
    
    audio.onended = () => setIsPlaying(null);
    audio.onerror = () => {
      setIsPlaying(null);
      toast({
        title: "Playback Error",
        description: "Failed to play alarm sound",
        variant: "destructive",
      });
    };

    audio.play();
    audioRef.current = audio;
    setIsPlaying(sound.id);
  };

  return (
    <Card className="p-6 space-y-6" data-testid="alarm-settings">
      <div>
        <h3 className="text-lg font-semibold mb-1">Alarm Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your prayer time reminders (works offline)
        </p>
      </div>

      {/* Individual Alarm Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pratah-alarm" className="text-base">Pratah Sandhya (Dawn)</Label>
            <Switch
              id="pratah-alarm"
              checked={settings.pratahEnabled}
              onCheckedChange={(enabled) => updateSettings({ pratahEnabled: enabled })}
              data-testid="switch-pratah-alarm"
            />
          </div>
          {settings.pratahEnabled && (
            <Input
              type="time"
              value={settings.pratahTime}
              onChange={(e) => updateSettings({ pratahTime: e.target.value })}
              data-testid="input-pratah-time"
              className="ml-auto w-32"
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="madhyahna-alarm" className="text-base">Madhyahna Sandhya (Noon)</Label>
            <Switch
              id="madhyahna-alarm"
              checked={settings.madhyahnaEnabled}
              onCheckedChange={(enabled) => updateSettings({ madhyahnaEnabled: enabled })}
              data-testid="switch-madhyahna-alarm"
            />
          </div>
          {settings.madhyahnaEnabled && (
            <Input
              type="time"
              value={settings.madhyahnaTime}
              onChange={(e) => updateSettings({ madhyahnaTime: e.target.value })}
              data-testid="input-madhyahna-time"
              className="ml-auto w-32"
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sayam-alarm" className="text-base">Sayam Sandhya (Evening)</Label>
            <Switch
              id="sayam-alarm"
              checked={settings.sayamEnabled}
              onCheckedChange={(enabled) => updateSettings({ sayamEnabled: enabled })}
              data-testid="switch-sayam-alarm"
            />
          </div>
          {settings.sayamEnabled && (
            <Input
              type="time"
              value={settings.sayamTime}
              onChange={(e) => updateSettings({ sayamTime: e.target.value })}
              data-testid="input-sayam-time"
              className="ml-auto w-32"
            />
          )}
        </div>
      </div>

      {/* Alarm Sound Selection */}
      <div className="space-y-2">
        <Label htmlFor="alarm-sound">Alarm Sound</Label>
        <Select 
          value={settings.alarmSoundId || 'default-bell'} 
          onValueChange={(value) => updateSettings({ alarmSoundId: value })}
        >
          <SelectTrigger id="alarm-sound" data-testid="select-alarm-sound">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableSounds.map((sound) => (
              <SelectItem key={sound.id} value={sound.id}>
                {sound.name} {'isCustom' in sound && sound.isCustom ? '(Custom)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Sound Preview and Actions */}
        <div className="flex gap-2 mt-2">
          {availableSounds.map((sound) => {
            if (sound.id !== settings.alarmSoundId) return null;
            return (
              <div key={sound.id} className="flex gap-2 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlaySound(sound)}
                  data-testid="button-preview-sound"
                >
                  {isPlaying === sound.id ? (
                    <><Pause className="h-4 w-4 mr-1" /> Stop</>
                  ) : (
                    <><Play className="h-4 w-4 mr-1" /> Preview</>
                  )}
                </Button>
                {'isCustom' in sound && sound.isCustom && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSound(sound.id)}
                    data-testid="button-delete-sound"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="alarm-volume">Volume</Label>
          <span className="text-sm text-gray-500">{settings.volume}%</span>
        </div>
        <Slider
          id="alarm-volume"
          value={[settings.volume]}
          onValueChange={([value]) => updateSettings({ volume: value })}
          max={100}
          step={1}
          data-testid="slider-alarm-volume"
        />
      </div>

      {/* Custom Sound Upload */}
      <div className="space-y-2 pt-4 border-t">
        <Label className="text-base">Add Custom Alarm Sound</Label>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload your own audio file (MP3, WAV, OGG, etc., max 10MB)
        </p>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="input-upload-sound"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            data-testid="button-upload-sound"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Custom Sound
          </Button>
        </div>
      </div>

      {/* Custom Sounds List */}
      {availableSounds.filter(s => 'isCustom' in s && s.isCustom).length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-base">Your Custom Sounds</Label>
          <div className="space-y-2">
            {availableSounds
              .filter(s => 'isCustom' in s && s.isCustom)
              .map((sound) => (
                <div key={sound.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{sound.name}</span>
                    <span className="text-xs text-gray-500">
                      {'fileSize' in sound && sound.fileSize && `(${(sound.fileSize / 1024).toFixed(0)} KB)`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlaySound(sound)}
                    >
                      {isPlaying === sound.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSound(sound.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}
