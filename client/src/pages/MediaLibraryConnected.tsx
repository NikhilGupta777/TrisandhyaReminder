import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, SkipBack, SkipForward, Volume2, Video, Music, Heart, ListMusic, Shuffle, Repeat, Repeat1, Plus, X, List } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Slider } from "@/components/ui/slider";
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

function AudioTrackItem({ audio, isFavorited, onToggleFavorite }: { 
  audio: MediaContent; 
  isFavorited: boolean;
  onToggleFavorite: (mediaId: string) => void;
}) {
  const { playTrack, playQueue, currentTrack, isPlaying, addToQueue } = useAudioPlayer();
  const isCurrentTrack = currentTrack?.id === audio.id;

  return (
    <Card className={`overflow-hidden transition-colors ${isCurrentTrack ? "border-primary" : ""}`} data-testid={`audio-${audio.id}`}>
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{audio.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{audio.artist || 'Unknown Artist'}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggleFavorite(audio.id)}
              data-testid={`button-favorite-${audio.id}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => addToQueue(audio)}
              data-testid={`button-add-queue-${audio.id}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              onClick={() => playQueue([audio], 0)}
              data-testid={`button-play-${audio.id}`}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}


export default function MediaLibraryConnected() {
  const { toast } = useToast();
  const { playQueue } = useAudioPlayer();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"videos" | "audio" | "favorites">("videos");

  const { data: categories = [] } = useQuery<MediaCategory[]>({
    queryKey: ["/api/media-categories"],
  });

  const { data: allMedia = [], isLoading } = useQuery<MediaContent[]>({
    queryKey: ["/api/media"],
  });

  const { data: favorites = [] } = useQuery<MediaContent[]>({
    queryKey: ["/api/media-favorites"],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (mediaId: string) => await apiRequest("POST", "/api/media-favorites", { mediaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-favorites"] });
      toast({ title: "Added to favorites" });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (mediaId: string) => await apiRequest("DELETE", `/api/media-favorites/${mediaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-favorites"] });
      toast({ title: "Removed from favorites" });
    },
  });

  const handleToggleFavorite = (mediaId: string) => {
    const isFavorited = favorites.some(f => f.id === mediaId);
    if (isFavorited) {
      removeFavoriteMutation.mutate(mediaId);
    } else {
      addFavoriteMutation.mutate(mediaId);
    }
  };

  const filteredMedia = activeCategory === "all" 
    ? allMedia 
    : allMedia.filter(m => m.categoryId === activeCategory);

  const audioMedia = filteredMedia.filter(m => m.type === "audio");
  const videoMedia = filteredMedia.filter(m => m.type === "youtube");
  const favoriteAudio = favorites.filter(m => m.type === "audio");
  const favoriteVideos = favorites.filter(m => m.type === "youtube");

  const handlePlayAll = (tracks: MediaContent[]) => {
    const audioTracks = tracks.filter(t => t.type === "audio");
    if (audioTracks.length > 0) {
      playQueue(audioTracks, 0);
      toast({ title: "Playing all tracks", description: `${audioTracks.length} tracks added to queue` });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-32">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">Media Library</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Loading spiritual content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-32">
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="videos" className="gap-2" data-testid="tab-videos">
            <Video className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Videos ({videoMedia.length})</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2" data-testid="tab-audio">
            <Music className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Audio ({audioMedia.length})</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2" data-testid="tab-favorites">
            <Heart className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Favorites ({favorites.length})</span>
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
          {audioMedia.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{audioMedia.length} tracks</p>
              <Button
                size="sm"
                onClick={() => handlePlayAll(audioMedia)}
                data-testid="button-play-all"
              >
                <ListMusic className="h-4 w-4 mr-2" />
                Play All
              </Button>
            </div>
          )}
          {audioMedia.length > 0 ? (
            <div className="grid gap-4">
              {audioMedia.map((audio) => (
                <AudioTrackItem 
                  key={audio.id} 
                  audio={audio}
                  isFavorited={favorites.some(f => f.id === audio.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 sm:p-12 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No audio available in this category</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4 mt-4">
          {favorites.length > 0 ? (
            <>
              {favoriteAudio.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Music className="h-5 w-5" />
                      Favorite Audio ({favoriteAudio.length})
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => handlePlayAll(favoriteAudio)}
                      data-testid="button-play-all-favorites"
                    >
                      <ListMusic className="h-4 w-4 mr-2" />
                      Play All
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {favoriteAudio.map((audio) => (
                      <AudioTrackItem 
                        key={audio.id} 
                        audio={audio}
                        isFavorited={true}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              )}

              {favoriteVideos.length > 0 && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Video className="h-5 w-5" />
                    Favorite Videos ({favoriteVideos.length})
                  </h3>
                  <div className="grid gap-4">
                    {favoriteVideos.map((video) => (
                      <VideoPlayer key={video.id} video={video} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 sm:p-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No favorites yet. Start adding tracks you love!</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
