import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Music, Video } from "lucide-react";
import { useState } from "react";
import type { MediaContent } from "@shared/schema";

function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  return `https://www.youtube.com/embed/${videoId}`;
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
            style={{ backgroundImage: video.thumbnailUrl ? `url(${video.thumbnailUrl})` : 'none', backgroundSize: 'cover' }}
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

export default function MediaLibraryConnected() {
  const { data: allMedia = [], isLoading } = useQuery<MediaContent[]>({
    queryKey: ["/api/media"],
  });

  const bhajans = allMedia.filter(m => m.type === "bhajan");
  const pravachans = allMedia.filter(m => m.type === "pravachan");

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

      <Tabs defaultValue="pravachan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="pravachan" className="gap-2" data-testid="tab-pravachan">
            <Video className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Pravachans</span>
          </TabsTrigger>
          <TabsTrigger value="bhajans" className="gap-2" data-testid="tab-bhajans">
            <Music className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Bhajans</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pravachan" className="space-y-4 mt-4">
          {pravachans.length > 0 ? (
            <div className="grid gap-4 sm:gap-6">
              {pravachans.map((video) => (
                <VideoPlayer key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <Card className="p-8 sm:p-12 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pravachan videos available yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bhajans" className="space-y-4 mt-4">
          {bhajans.length > 0 ? (
            <div className="grid gap-4 sm:gap-6">
              {bhajans.map((bhajan) => (
                <VideoPlayer key={bhajan.id} video={bhajan} />
              ))}
            </div>
          ) : (
            <Card className="p-8 sm:p-12 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No bhajans available yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
