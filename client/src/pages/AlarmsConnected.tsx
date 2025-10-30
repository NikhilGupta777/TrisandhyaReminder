import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlarmInterface } from "@/components/AlarmInterface";
import { LoadingSpinner, LoadingOverlay } from "@/components/LoadingSpinner";
import { Play, Pause } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AlarmSettings, AlarmSound } from "@shared/schema";

export default function AlarmsConnected() {
  const { toast } = useToast();
  const [showAlarm, setShowAlarm] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [audio] = useState(new Audio());
  
  const { data: settings, isLoading: settingsLoading } = useQuery<AlarmSettings>({
    queryKey: ["/api/alarm-settings"],
  });

  const { data: alarmSounds = [], isLoading: soundsLoading } = useQuery<AlarmSound[]>({
    queryKey: ["/api/alarm-sounds"],
  });

  const defaultSound = alarmSounds.find(s => s.isDefault);
  const currentSoundId = settings?.alarmSoundId || defaultSound?.id;

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<AlarmSettings>) => {
      return await apiRequest("POST", "/api/alarm-settings", { ...settings, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarm-settings"] });
      toast({ title: "Settings updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const toggleAlarm = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handlePlaySound = async (sound: AlarmSound) => {
    if (playingSound === sound.id) {
      audio.pause();
      setPlayingSound(null);
    } else {
      audio.src = sound.url;
      audio.volume = (settings?.volume || 80) / 100;
      
      try {
        await audio.play();
        setPlayingSound(sound.id);
        audio.onended = () => setPlayingSound(null);
      } catch (error) {
        toast({
          title: "Playback Error",
          description: "Failed to play alarm sound. The audio file may not be available.",
          variant: "destructive",
        });
        setPlayingSound(null);
      }
    }
  };

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Alarm Configuration</h1>
        <p className="text-muted-foreground">Set up reminders for your daily Sandhya practices</p>
      </div>

      <LoadingOverlay isVisible={settingsLoading} text="Loading settings..." />

      <Card className="p-6 space-y-6 relative" data-testid="alarm-settings">
        <h3 className="text-lg font-semibold">Alarm Settings</h3>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="pratah-alarm" className="text-base font-semibold">Pratah Sandhya</Label>
              <Switch
                id="pratah-alarm"
                checked={settings?.pratahEnabled}
                onCheckedChange={(checked) => toggleAlarm("pratahEnabled", checked)}
                data-testid="switch-pratah-alarm"
              />
            </div>
            <div className="flex items-center gap-2 pl-4">
              <Label htmlFor="pratah-time" className="text-sm text-muted-foreground">Time:</Label>
              <input
                type="time"
                id="pratah-time"
                value={settings?.pratahTime || "05:30"}
                onChange={(e) => updateSettingsMutation.mutate({ pratahTime: e.target.value })}
                disabled={!settings?.pratahEnabled}
                className="px-3 py-1.5 rounded-md border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="input-pratah-time"
              />
              <span className="text-xs text-muted-foreground">(3:35 AM - 6:30 AM)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="madhyahna-alarm" className="text-base font-semibold">Madhyahna Sandhya</Label>
              <Switch
                id="madhyahna-alarm"
                checked={settings?.madhyahnaEnabled}
                onCheckedChange={(checked) => toggleAlarm("madhyahnaEnabled", checked)}
                data-testid="switch-madhyahna-alarm"
              />
            </div>
            <div className="flex items-center gap-2 pl-4">
              <Label htmlFor="madhyahna-time" className="text-sm text-muted-foreground">Time:</Label>
              <input
                type="time"
                id="madhyahna-time"
                value={settings?.madhyahnaTime || "12:00"}
                onChange={(e) => updateSettingsMutation.mutate({ madhyahnaTime: e.target.value })}
                disabled={!settings?.madhyahnaEnabled}
                className="px-3 py-1.5 rounded-md border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="input-madhyahna-time"
              />
              <span className="text-xs text-muted-foreground">(11:30 AM - 1:00 PM)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="sayam-alarm" className="text-base font-semibold">Sayam Sandhya</Label>
              <Switch
                id="sayam-alarm"
                checked={settings?.sayamEnabled}
                onCheckedChange={(checked) => toggleAlarm("sayamEnabled", checked)}
                data-testid="switch-sayam-alarm"
              />
            </div>
            <div className="flex items-center gap-2 pl-4">
              <Label htmlFor="sayam-time" className="text-sm text-muted-foreground">Time:</Label>
              <input
                type="time"
                id="sayam-time"
                value={settings?.sayamTime || "18:00"}
                onChange={(e) => updateSettingsMutation.mutate({ sayamTime: e.target.value })}
                disabled={!settings?.sayamEnabled}
                className="px-3 py-1.5 rounded-md border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="input-sayam-time"
              />
              <span className="text-xs text-muted-foreground">(5:30 PM - 6:30 PM)</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alarm-sound">Alarm Sound</Label>
          <Select
            value={currentSoundId}
            onValueChange={(value) => updateSettingsMutation.mutate({ alarmSoundId: value })}
          >
            <SelectTrigger id="alarm-sound" data-testid="select-alarm-sound">
              <SelectValue placeholder="Select alarm sound" />
            </SelectTrigger>
            <SelectContent>
              {alarmSounds.map((sound) => (
                <SelectItem key={sound.id} value={sound.id}>
                  {sound.name} {sound.isDefault && "(Default)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="alarm-volume">Volume</Label>
            <span className="text-sm text-muted-foreground">{settings?.volume || 80}%</span>
          </div>
          <Slider
            id="alarm-volume"
            value={[settings?.volume || 80]}
            onValueChange={(value) => updateSettingsMutation.mutate({ volume: value[0] })}
            max={100}
            step={1}
            data-testid="slider-alarm-volume"
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4 relative">
        <LoadingOverlay isVisible={soundsLoading} text="Loading sounds..." />
        <h3 className="font-semibold">Available Alarm Sounds</h3>
        <div className="space-y-3">
          {alarmSounds.map((sound) => (
            <div key={sound.id} className="flex items-center justify-between p-3 border rounded-md" data-testid={`sound-preview-${sound.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{sound.name}</p>
                  {sound.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
                {sound.description && (
                  <p className="text-sm text-muted-foreground">{sound.description}</p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handlePlaySound(sound)}
                disabled={updateSettingsMutation.isPending}
                data-testid={`button-play-sound-${sound.id}`}
              >
                {playingSound === sound.id ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Test Alarm Interface</h3>
        <p className="text-sm text-muted-foreground">
          Preview how the alarm will appear when it's time for Sandhya
        </p>
        <Button onClick={() => setShowAlarm(true)} data-testid="button-test-alarm">
          Show Test Alarm
        </Button>
      </Card>

      <AlarmInterface
        open={showAlarm}
        onOpenChange={setShowAlarm}
        sandhyaName="Pratah Sandhya"
      />
    </div>
  );
}
