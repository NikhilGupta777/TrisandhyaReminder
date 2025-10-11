import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Volume2 } from "lucide-react";

export function JapCounter() {
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTap = () => {
    setCount((prev) => prev + 1);
    console.log("Jap count:", count + 1);
  };

  const handleReset = () => {
    setCount(0);
    console.log("Counter reset");
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? "Audio stopped" : "Audio playing");
  };

  return (
    <Card className="p-8 text-center space-y-6" data-testid="jap-counter">
      <h3 className="text-xl font-semibold font-serif">Madhav Naam Jap</h3>
      
      <div className="flex flex-col items-center gap-6">
        <div className="text-6xl font-bold tabular-nums text-primary" data-testid="jap-count">
          {count}
        </div>
        
        <button
          onClick={handleTap}
          className="w-48 h-48 rounded-full bg-primary text-primary-foreground font-semibold text-xl shadow-lg hover-elevate active-elevate-2 transition-all border-4 border-primary-border"
          data-testid="button-tap-jap"
        >
          TAP TO CHANT
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
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
          data-testid="button-toggle-audio"
        >
          <Volume2 className="h-4 w-4 mr-2" />
          {isPlaying ? "Playing" : "Play Chant"}
        </Button>
      </div>
    </Card>
  );
}
