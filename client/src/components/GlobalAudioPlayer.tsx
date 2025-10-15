import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffleEnabled,
    repeatMode,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleShuffle,
    toggleRepeat,
    pauseTrack,
  } = useAudioPlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    pauseTrack();
    // Note: Track remains in queue, just paused
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setIsMinimized(false)}
          data-testid="button-expand-player"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-2xl">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer group" 
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const percent = (e.clientX - rect.left) / rect.width;
             seekTo(percent * duration);
           }}
           data-testid="progress-bar">
        <div 
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />
        <div 
          className="absolute top-0 w-3 h-3 bg-primary rounded-full -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack.thumbnailUrl && (
              <img 
                src={currentTrack.thumbnailUrl} 
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate" data-testid="text-track-title">
                {currentTrack.title}
              </p>
              {currentTrack.artist && (
                <p className="text-xs text-muted-foreground truncate" data-testid="text-track-artist">
                  {currentTrack.artist}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Shuffle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={cn(shuffleEnabled && "text-primary")}
              data-testid="button-shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            {/* Previous */}
            <Button
              variant="ghost"
              size="sm"
              onClick={playPrevious}
              data-testid="button-previous"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            {/* Play/Pause */}
            <Button
              size="sm"
              onClick={togglePlayPause}
              className="rounded-full"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Next */}
            <Button
              variant="ghost"
              size="sm"
              onClick={playNext}
              data-testid="button-next"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            {/* Repeat */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepeat}
              className={cn(repeatMode !== "off" && "text-primary")}
              data-testid="button-repeat"
            >
              {repeatMode === "one" ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Time & Volume */}
          <div className="flex items-center gap-3">
            {/* Time Display */}
            <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block" data-testid="text-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume Control */}
            <div className="relative hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                data-testid="button-volume"
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              {showVolumeSlider && (
                <div className="absolute bottom-full right-0 mb-2 bg-popover border rounded-lg p-3 shadow-lg">
                  <Slider
                    value={[volume]}
                    onValueChange={(v) => setVolumeLevel(v[0])}
                    max={100}
                    step={1}
                    className="w-24"
                    data-testid="slider-volume"
                  />
                </div>
              )}
            </div>

            {/* Minimize/Close Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="hidden lg:flex"
              data-testid="button-minimize-player"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              data-testid="button-close-player"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
