import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Volume2, VolumeX, Save, Settings, TrendingUp, Trophy, Target, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JapaAudio, JapaSettings } from "@shared/schema";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export function JapCounterConnected() {
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasAchievedGoal, setHasAchievedGoal] = useState(false);
  const [showGoalAchievedDialog, setShowGoalAchievedDialog] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const { data: japaAudios = [] } = useQuery<JapaAudio[]>({
    queryKey: ["/api/japa-audios"],
  });

  const { data: settings } = useQuery<JapaSettings>({
    queryKey: ["/api/japa-settings"],
  });

  const { data: todayProgress } = useQuery({
    queryKey: ["/api/sadhana-progress", new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/sadhana-progress/${today}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return await apiRequest("POST", "/api/japa/increment", { count, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sadhana-progress"] });
      toast({ 
        title: "Progress Saved!", 
        description: `You've completed ${count} mantras today`,
      });
    },
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

  const dailyGoal = settings?.dailyGoal || 108;
  const previousCount = todayProgress?.japCount || 0;
  const totalCount = previousCount + count;
  const goalProgress = Math.min((totalCount / dailyGoal) * 100, 100);
  const selectedAudio = japaAudios.find(a => a.id === settings?.japaAudioId) || japaAudios[0];

  useEffect(() => {
    if (totalCount >= dailyGoal && !hasAchievedGoal && count > 0) {
      setHasAchievedGoal(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setShowGoalAchievedDialog(true);
    }
  }, [totalCount, dailyGoal, hasAchievedGoal, count]);

  const handleTap = () => {
    setCount((prev) => prev + 1);
    if (settings?.hapticEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleReset = () => {
    setCount(0);
    setHasAchievedGoal(false);
  };

  const toggleAudio = () => {
    if (!audioRef.current || !selectedAudio) {
      toast({ 
        title: "No audio available", 
        description: "Please select a chant audio in settings",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error("Error playing audio:", error);
        toast({ 
          title: "Playback error", 
          description: "Could not play the audio. Please try again.",
          variant: "destructive"
        });
      });
    }
  };

  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const handleSaveProgress = () => {
    if (count > 0) {
      saveProgressMutation.mutate();
    } else {
      toast({ 
        title: "No progress to save", 
        description: "Start chanting to save your progress",
        variant: "destructive"
      });
    }
  };

  const handleSetCustomGoal = () => {
    const newGoal = parseInt(customGoal);
    if (isNaN(newGoal) || newGoal < 1) {
      toast({
        title: "Invalid goal",
        description: "Please enter a valid number greater than 0",
        variant: "destructive"
      });
      return;
    }
    updateSettingsMutation.mutate({ dailyGoal: newGoal });
    setCustomGoal("");
    setShowSettings(false);
  };

  const handleSetNextGoal = (newGoal: number) => {
    updateSettingsMutation.mutate({ dailyGoal: newGoal });
    setShowGoalAchievedDialog(false);
    setHasAchievedGoal(false);
    toast({
      title: "New goal set!",
      description: `Your next goal is ${newGoal} mantras`,
    });
  };

  const handleContinueWithSameGoal = () => {
    setShowGoalAchievedDialog(false);
    setHasAchievedGoal(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 sm:p-8 text-center space-y-6" data-testid="jap-counter">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold font-serif">Madhav Naam Jap</h3>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-jap-settings">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Jap Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Daily Goal</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[108, 216, 324].map((goal) => (
                      <Button
                        key={goal}
                        variant={dailyGoal === goal ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSettingsMutation.mutate({ dailyGoal: goal })}
                        data-testid={`button-goal-${goal}`}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="custom-goal">Custom Goal</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="custom-goal"
                        type="number"
                        placeholder="Enter custom goal"
                        value={customGoal}
                        onChange={(e) => setCustomGoal(e.target.value)}
                        data-testid="input-custom-goal"
                      />
                      <Button
                        onClick={handleSetCustomGoal}
                        disabled={!customGoal || updateSettingsMutation.isPending}
                        data-testid="button-set-custom-goal"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Set
                      </Button>
                    </div>
                  </div>
                </div>
                {japaAudios.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Chant Audio</label>
                    <div className="space-y-2 mt-2">
                      {japaAudios.map((audio) => (
                        <Button
                          key={audio.id}
                          variant={selectedAudio?.id === audio.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => updateSettingsMutation.mutate({ japaAudioId: audio.id })}
                          data-testid={`button-audio-${audio.id}`}
                        >
                          {audio.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {previousCount > 0 && (
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Previous today: {previousCount} mantras</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center gap-6">
          <div className="space-y-3 w-full max-w-md">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Goal Progress</span>
              </span>
              <span className="font-semibold">{totalCount} / {dailyGoal}</span>
            </div>
            <Progress value={goalProgress} className="h-2" />
            {totalCount >= dailyGoal && (
              <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-semibold">Goal Achieved!</span>
              </div>
            )}
          </div>

          <div className="text-6xl font-bold tabular-nums text-primary" data-testid="jap-count">
            {count}
          </div>
          
          <button
            onClick={handleTap}
            className={cn(
              "w-48 h-48 rounded-full font-semibold text-xl shadow-lg transition-all border-4",
              "bg-primary text-primary-foreground border-primary-border",
              "hover:scale-105 active:scale-95",
              totalCount >= dailyGoal && "bg-gradient-to-br from-primary to-primary/80 animate-pulse"
            )}
            data-testid="button-tap-jap"
          >
            TAP TO CHANT
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={handleReset}
            data-testid="button-reset-counter"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="default"
            onClick={toggleAudio}
            disabled={!selectedAudio}
            data-testid="button-toggle-audio"
          >
            {isPlaying ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
            {isPlaying ? "Playing" : "Play Chant"}
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={handleSaveProgress}
            disabled={count === 0 || saveProgressMutation.isPending}
            data-testid="button-save-progress"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveProgressMutation.isPending ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </Card>

      {selectedAudio && (
        <audio
          ref={audioRef}
          src={selectedAudio.url}
          onEnded={handleAudioEnded}
          loop={isPlaying}
          preload="auto"
        />
      )}

      <Dialog open={showGoalAchievedDialog} onOpenChange={setShowGoalAchievedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-primary" />
              Goal Achieved!
            </DialogTitle>
            <DialogDescription>
              Congratulations! You've completed {totalCount} mantras and reached your goal of {dailyGoal}!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Would you like to set a new goal and continue your practice?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                dailyGoal + 108,
                dailyGoal * 2,
                dailyGoal + 216,
                1008
              ].filter((g, i, arr) => g > dailyGoal && arr.indexOf(g) === i).slice(0, 4).map((nextGoal) => (
                <Button
                  key={nextGoal}
                  variant="outline"
                  onClick={() => handleSetNextGoal(nextGoal)}
                  data-testid={`button-next-goal-${nextGoal}`}
                >
                  {nextGoal} mantras
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleContinueWithSameGoal}
              className="w-full sm:w-auto"
              data-testid="button-continue-same-goal"
            >
              Continue with same goal
            </Button>
            <Button
              onClick={() => {
                setShowGoalAchievedDialog(false);
                setShowSettings(true);
              }}
              className="w-full sm:w-auto"
              data-testid="button-set-different-goal"
            >
              Set different goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
