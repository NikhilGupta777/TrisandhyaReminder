import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Pencil, Upload, Music, Video, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MediaContent, MediaCategory } from "@shared/schema";

export default function MediaManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaContent | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [mediaType, setMediaType] = useState<string>("youtube");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  
  const { data: categories = [] } = useQuery<MediaCategory[]>({
    queryKey: ["/api/media-categories"],
  });

  const { data: media = [] } = useQuery<MediaContent[]>({
    queryKey: ["/api/media"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/media", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setIsAddDialogOpen(false);
      setUploadedFileUrl("");
      setMediaType("youtube");
      toast({ title: "Success", description: "Media created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/media/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setEditingMedia(null);
      setUploadedFileUrl("");
      toast({ title: "Success", description: "Media updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Success", description: "Media deleted successfully" });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadProgress(true);
    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();
      setUploadedFileUrl(data.url);
      toast({ title: "Success", description: "File uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const url = mediaType === "youtube" 
      ? formData.get("url") as string
      : uploadedFileUrl;

    if (!url) {
      toast({ title: "Error", description: "Please provide a URL or upload a file", variant: "destructive" });
      return;
    }

    const data = {
      title: formData.get("title"),
      categoryId: formData.get("categoryId") || null,
      type: mediaType,
      artist: formData.get("artist"),
      url: url,
      thumbnailUrl: formData.get("thumbnailUrl") || null,
      duration: formData.get("duration") || null,
      description: formData.get("description") || null,
      fileSize: null,
      mimeType: null,
    };

    if (editingMedia) {
      updateMutation.mutate({ id: editingMedia.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
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
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif">Media Management</h1>
          <p className="text-muted-foreground">Upload audio files or add YouTube videos</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-media">
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Media</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={mediaType} onValueChange={setMediaType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="youtube" data-testid="tab-youtube">
                    <Video className="h-4 w-4 mr-2" />
                    YouTube Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" data-testid="tab-audio">
                    <Music className="h-4 w-4 mr-2" />
                    Audio File
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="youtube" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube URL</Label>
                    <Input 
                      id="youtube-url" 
                      name="url" 
                      type="url" 
                      required={mediaType === "youtube"}
                      placeholder="https://www.youtube.com/watch?v=..." 
                      data-testid="input-youtube-url" 
                    />
                    <p className="text-xs text-muted-foreground">Paste the full YouTube video URL</p>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="audio-file">Upload Audio File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="audio-file"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        disabled={uploadProgress}
                        data-testid="input-audio-file"
                      />
                      {uploadProgress && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {uploadedFileUrl && (
                      <p className="text-xs text-green-600">File uploaded successfully!</p>
                    )}
                    <p className="text-xs text-muted-foreground">Supported formats: MP3, WAV, AAC, FLAC, OGG, M4A (Max 50MB)</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required data-testid="input-title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artist/Speaker</Label>
                <Input id="artist" name="artist" data-testid="input-artist" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                <Input id="thumbnailUrl" name="thumbnailUrl" type="url" placeholder="https://..." data-testid="input-thumbnail" />
                <p className="text-xs text-muted-foreground">YouTube thumbnails are auto-extracted</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g., 5:30" data-testid="input-duration" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" placeholder="Brief description" data-testid="input-description" />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createMutation.isPending || (mediaType === "audio" && !uploadedFileUrl)}
                data-testid="button-submit"
              >
                {createMutation.isPending ? "Creating..." : "Create Media"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="divide-y">
          {media.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No media added yet. Click "Add Media" to get started.</p>
            </div>
          ) : (
            media.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between" data-testid={`media-item-${item.id}`}>
                <div className="flex items-center gap-4 flex-1">
                  {item.type === "youtube" && item.url && (
                    <img 
                      src={item.thumbnailUrl || getYouTubeThumbnail(item.url)}
                      alt={item.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  )}
                  {item.type === "audio" && (
                    <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="capitalize">{item.type}</span>
                      {item.artist && <span>• {item.artist}</span>}
                      {item.duration && <span>• {item.duration}</span>}
                      {item.categoryId && (
                        <span>• {categories.find(c => c.id === item.categoryId)?.displayName || "Unknown Category"}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog open={editingMedia?.id === item.id} onOpenChange={(open) => !open && setEditingMedia(null)}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => setEditingMedia(item)} data-testid={`button-edit-${item.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Media</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Title</Label>
                          <Input id="edit-title" name="title" defaultValue={editingMedia?.title} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-categoryId">Category</Label>
                          <Select name="categoryId" defaultValue={editingMedia?.categoryId || "none"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Category</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.displayName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-artist">Artist/Speaker</Label>
                          <Input id="edit-artist" name="artist" defaultValue={editingMedia?.artist || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-url">URL</Label>
                          <Input id="edit-url" name="url" type="url" defaultValue={editingMedia?.url} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-thumbnailUrl">Thumbnail URL</Label>
                          <Input id="edit-thumbnailUrl" name="thumbnailUrl" type="url" defaultValue={editingMedia?.thumbnailUrl || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-duration">Duration</Label>
                          <Input id="edit-duration" name="duration" defaultValue={editingMedia?.duration || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Input id="edit-description" name="description" defaultValue={editingMedia?.description || ""} />
                        </div>
                        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? "Updating..." : "Update Media"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this media?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
