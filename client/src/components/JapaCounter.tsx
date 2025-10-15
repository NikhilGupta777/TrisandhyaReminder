import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Pause, Settings, Vibrate } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { JapaSettings, JapaAudio, SadhanaProgress } from "@shared/schema";

export default function JapaCounter() {
  const { toast } = useToast();
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const { data: settings } = useQuery<JapaSettings>({
    queryKey: ["/api/japa-settings"],
  });

  const { data: audios = [] } = useQuery<JapaAudio[]>({
    queryKey: ["/api/japa-audios"],
  });

  const { data: progress } = useQuery<SadhanaProgress>({
    queryKey: ["/api/progress", today],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<JapaSettings>) => {
      return await apiRequest("PATCH", "/api/japa-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/japa-settings"] });
      toast({ title: "Settings updated" });
    },
  });

  const incrementMutation = useMutation({
    mutationFn: async (incrementCount: number) => {
      return await apiRequest("POST", "/api/japa/increment", { count: incrementCount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      setCount(0);
      toast({ title: "Japa count saved to progress!" });
    },
  });

  useEffect(() => {
    if (settings?.japaAudioId && audios.length > 0) {
      const selectedAudio = audios.find(a => a.id === settings.japaAudioId);
      if (selectedAudio) {
        audio.src = selectedAudio.url;
        audio.loop = true;
      }
    }
  }, [settings, audios, audio]);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    
    if (settings?.hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (settings?.soundEnabled && audio.src) {
      if (!isPlaying) {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSaveProgress = () => {
    if (count > 0) {
      incrementMutation.mutate(count);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const dailyGoal = settings?.dailyGoal || 108;
  const todayCount = (progress?.japCount || 0) + count;
  const progressPercent = Math.min((todayCount / dailyGoal) * 100, 100);

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20" data-testid="card-japa-counter">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-serif">Madhav Jap Counter</CardTitle>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-japa-settings">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Japa Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Japa Audio</Label>
                <Select
                  value={settings?.japaAudioId || ""}
                  onValueChange={(value) => updateSettingsMutation.mutate({ japaAudioId: value })}
                  data-testid="select-japa-audio"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audio" />
                  </SelectTrigger>
                  <SelectContent>
                    {audios.map((audio) => (
                      <SelectItem key={audio.id} value={audio.id}>
                        {audio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vibrate className="h-4 w-4" />
                  <Label htmlFor="haptic-toggle">Haptic Vibration</Label>
                </div>
                <Switch
                  id="haptic-toggle"
                  checked={settings?.hapticEnabled || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ hapticEnabled: checked })}
                  data-testid="switch-haptic"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound-toggle">Play Audio</Label>
                <Switch
                  id="sound-toggle"
                  checked={settings?.soundEnabled || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ soundEnabled: checked })}
                  data-testid="switch-sound"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-goal">Daily Goal</Label>
                <input
                  id="daily-goal"
                  type="number"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  defaultValue={settings?.dailyGoal || 108}
                  onBlur={(e) => updateSettingsMutation.mutate({ dailyGoal: parseInt(e.target.value) })}
                  data-testid="input-daily-goal"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-6xl font-bold text-primary" data-testid="text-japa-count">
            {count}
          </div>
          <p className="text-sm text-muted-foreground">Current Session</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Today's Progress</span>
            <span className="font-medium" data-testid="text-today-total">
              {todayCount} / {dailyGoal}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" data-testid="progress-japa" />
        </div>

        <div className="flex gap-2">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleIncrement}
            data-testid="button-increment-japa"
          >
            <Plus className="h-5 w-5 mr-2" />
            Count
          </Button>
          
          {audio.src && (
            <Button
              size="lg"
              variant="outline"
              onClick={toggleAudio}
              data-testid="button-toggle-audio"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          )}
        </div>

        {count > 0 && (
          <Button
            className="w-full"
            variant="secondary"
            onClick={handleSaveProgress}
            disabled={incrementMutation.isPending}
            data-testid="button-save-japa"
          >
            {incrementMutation.isPending ? "Saving..." : `Save ${count} to Today's Progress`}
          </Button>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Total Saved Today: {progress?.japCount || 0} chants
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
