import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Pencil } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MediaContent } from "@shared/schema";

export default function MediaManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaContent | null>(null);
  
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
      toast({ title: "Success", description: "Media created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/media/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setEditingMedia(null);
      toast({ title: "Success", description: "Media updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Success", description: "Media deleted successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      type: formData.get("type"),
      artist: formData.get("artist"),
      url: formData.get("url"),
      thumbnailUrl: formData.get("thumbnailUrl"),
      duration: formData.get("duration"),
      description: formData.get("description"),
    };

    if (editingMedia) {
      updateMutation.mutate({ id: editingMedia.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif">Media Management</h1>
          <p className="text-muted-foreground">Manage bhajans and pravachan videos</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-media">
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Media</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required data-testid="input-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" required>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bhajan">Bhajan</SelectItem>
                    <SelectItem value="pravachan">Pravachan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist/Speaker</Label>
                <Input id="artist" name="artist" data-testid="input-artist" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">YouTube URL</Label>
                <Input id="url" name="url" type="url" required placeholder="https://www.youtube.com/watch?v=..." data-testid="input-url" />
                <p className="text-xs text-muted-foreground">Paste the full YouTube video URL</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                <Input id="thumbnailUrl" name="thumbnailUrl" type="url" placeholder="https://i.ytimg.com/vi/..." data-testid="input-thumbnail" />
                <p className="text-xs text-muted-foreground">YouTube thumbnail will be auto-extracted if not provided</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g., 5:30" data-testid="input-duration" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" placeholder="Brief description of the content" data-testid="input-description" />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit">
                Create Media
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="divide-y">
          {media.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between" data-testid={`media-item-${item.id}`}>
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="capitalize">{item.type}</span>
                  {item.artist && <span>• {item.artist}</span>}
                  {item.duration && <span>• {item.duration}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={editingMedia?.id === item.id} onOpenChange={(open) => !open && setEditingMedia(null)}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setEditingMedia(item)} data-testid={`button-edit-${item.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Media</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input id="edit-title" name="title" defaultValue={editingMedia?.title} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-type">Type</Label>
                        <Select name="type" defaultValue={editingMedia?.type} required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bhajan">Bhajan</SelectItem>
                            <SelectItem value="pravachan">Pravachan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-artist">Artist/Speaker</Label>
                        <Input id="edit-artist" name="artist" defaultValue={editingMedia?.artist || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-url">YouTube URL</Label>
                        <Input id="edit-url" name="url" type="url" defaultValue={editingMedia?.url} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-thumbnailUrl">Thumbnail URL (Optional)</Label>
                        <Input id="edit-thumbnailUrl" name="thumbnailUrl" type="url" defaultValue={editingMedia?.thumbnailUrl || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-duration">Duration</Label>
                        <Input id="edit-duration" name="duration" defaultValue={editingMedia?.duration || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description (Optional)</Label>
                        <Input id="edit-description" name="description" defaultValue={editingMedia?.description || ""} />
                      </div>
                      <Button type="submit" className="w-full">Update Media</Button>
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
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
