import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

type MediaPlayerProps = {
  title: string;
  artist?: string;
  type: "audio" | "video";
};

export function MediaPlayer({ title, artist, type }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="p-4 space-y-4" data-testid="media-player">
      <div className="space-y-1">
        <h4 className="font-semibold" data-testid="media-title">{title}</h4>
        {artist && <p className="text-sm text-muted-foreground">{artist}</p>}
      </div>

      <div className="space-y-2">
        <Slider defaultValue={[33]} max={100} step={1} className="w-full" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>1:24</span>
          <span>5:47</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" data-testid="button-skip-back">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={togglePlay} data-testid="button-play-pause">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-skip-forward">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-20" />
        </div>
      </div>
    </Card>
  );
}
