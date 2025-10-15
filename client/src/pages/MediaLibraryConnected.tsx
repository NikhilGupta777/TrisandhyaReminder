import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Video, Music } from "lucide-react";
import type { MediaContent, MediaCategory } from "@shared/schema";

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/\s]+)/,
    /youtube\.com\/shorts\/([^&\?\/\s]+)/,
    /youtube\.com\/live\/([^&\?\/\s]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1].split('?')[0];
    }
  }
  
  return null;
}

function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
}

function getYouTubeThumbnail(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

function VideoPlayer({ video }: { video: MediaContent }) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <Card className="overflow-hidden" data-testid={`video-${video.id}`}>
      <div className="relative aspect-video bg-black">
        {isPlaying ? (
          <iframe
            src={getYouTubeEmbedUrl(video.url)}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer relative"
            onClick={() => setIsPlaying(true)}
            style={{ 
              backgroundImage: video.thumbnailUrl 
                ? `url(${video.thumbnailUrl})` 
                : `url(${getYouTubeThumbnail(video.url)})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/40 hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="bg-primary rounded-full p-4 hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{video.title}</h3>
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <span>{video.artist || 'Unknown Artist'}</span>
          <span>{video.duration}</span>
        </div>
        {video.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
        )}
      </div>
    </Card>
  );
}

function AudioPlayer({ audio }: { audio: MediaContent }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden" data-testid={`audio-${audio.id}`}>
      <audio ref={audioRef} src={audio.url} preload="metadata" />
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{audio.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{audio.artist || 'Unknown Artist'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Slider 
            value={[currentTime]} 
            max={duration || 100} 
            step={0.1}
            onValueChange={handleSeek}
            className="w-full" 
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={skipBackward} data-testid={`button-skip-back-${audio.id}`}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              className="h-10 w-10"
              onClick={togglePlay} 
              data-testid={`button-play-${audio.id}`}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={skipForward} data-testid={`button-skip-forward-${audio.id}`}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider 
              value={volume} 
              onValueChange={setVolume} 
              max={100} 
              step={1} 
              className="w-20" 
            />
          </div>
        </div>

        {audio.description && (
          <p className="text-xs text-muted-foreground pt-2 border-t">{audio.description}</p>
        )}
      </div>
    </Card>
  );
}

export default function MediaLibraryConnected() {
  const { data: categories = [] } = useQuery<MediaCategory[]>({
    queryKey: ["/api/media-categories"],
  });

  const { data: allMedia = [], isLoading } = useQuery<MediaContent[]>({
    queryKey: ["/api/media"],
  });

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredMedia = activeCategory === "all" 
    ? allMedia 
    : allMedia.filter(m => m.categoryId === activeCategory);

  const audioMedia = filteredMedia.filter(m => m.type === "audio");
  const videoMedia = filteredMedia.filter(m => m.type === "youtube");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">Media Library</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Loading spiritual content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">Media Library</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Sacred bhajans and pravachan videos for spiritual growth</p>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            data-testid="category-all"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              data-testid={`category-${category.name}`}
            >
              {category.displayName}
            </Button>
          ))}
        </div>
      )}

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="videos" className="gap-2" data-testid="tab-videos">
            <Video className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Videos ({videoMedia.length})</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2" data-testid="tab-audio">
            <Music className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Audio ({audioMedia.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4 mt-4">
          {videoMedia.length > 0 ? (
            <div className="grid gap-4 sm:gap-6">
              {videoMedia.map((video) => (
                <VideoPlayer key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <Card className="p-8 sm:p-12 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No videos available in this category</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-4 mt-4">
          {audioMedia.length > 0 ? (
            <div className="grid gap-4 sm:gap-6">
              {audioMedia.map((audio) => (
                <AudioPlayer key={audio.id} audio={audio} />
              ))}
            </div>
          ) : (
            <Card className="p-8 sm:p-12 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No audio available in this category</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
