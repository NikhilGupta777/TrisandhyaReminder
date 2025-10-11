import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play } from "lucide-react";
import type { MediaContent } from "@shared/schema";

export default function MediaLibraryConnected() {
  const { data: allMedia = [] } = useQuery<MediaContent[]>({
    queryKey: ["/api/media"],
  });

  const bhajans = allMedia.filter(m => m.type === "bhajan");
  const pravachans = allMedia.filter(m => m.type === "pravachan");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Media Library</h1>
        <p className="text-muted-foreground">Spiritual audio and video resources</p>
      </div>

      <Tabs defaultValue="bhajans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bhajans" data-testid="tab-bhajans">Bhajans</TabsTrigger>
          <TabsTrigger value="pravachan" data-testid="tab-pravachan">Pravachan Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="bhajans" className="space-y-4">
          {bhajans.length > 0 ? (
            bhajans.map((bhajan) => (
              <MediaPlayer
                key={bhajan.id}
                title={bhajan.title}
                artist={bhajan.artist || undefined}
                type="audio"
              />
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No bhajans available yet
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pravachan" className="space-y-4">
          {pravachans.length > 0 ? (
            pravachans.map((video) => (
              <Card key={video.id} className="p-4 space-y-3" data-testid={`video-${video.id}`}>
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  <Play className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{video.title}</h4>
                    <p className="text-sm text-muted-foreground">{video.duration}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No pravachan videos available yet
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
