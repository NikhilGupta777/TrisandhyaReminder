import { Card } from "@/components/ui/card";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play } from "lucide-react";

const bhajans = [
  { id: 1, title: "Madhav Naam Bhajan", artist: "Traditional" },
  { id: 2, title: "Jagannath Ashtakam", artist: "Devotional" },
  { id: 3, title: "Om Namo Bhagavate", artist: "Sacred Chants" },
];

const videos = [
  { id: 1, title: "Pratah Sandhya Practice Guide", duration: "12:45" },
  { id: 2, title: "Bhavishya Malika Pravachan", duration: "45:20" },
  { id: 3, title: "Madhyahna Sandhya Tutorial", duration: "15:30" },
];

export default function MediaLibrary() {
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
          {bhajans.map((bhajan) => (
            <MediaPlayer
              key={bhajan.id}
              title={bhajan.title}
              artist={bhajan.artist}
              type="audio"
            />
          ))}
        </TabsContent>

        <TabsContent value="pravachan" className="space-y-4">
          {videos.map((video) => (
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
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
