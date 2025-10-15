import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Pencil, Play, Pause, Upload, Link, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JapaAudio } from "@shared/schema";

export default function JapaAudiosManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<JapaAudio | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio] = useState(new Audio());
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<string>("upload");
  
  const { data: audios = [] } = useQuery<JapaAudio[]>({
    queryKey: ["/api/japa-audios"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/japa-audios", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/japa-audios"] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Japa audio created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/japa-audios/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/japa-audios"] });
      setEditingAudio(null);
      toast({ title: "Success", description: "Japa audio updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/japa-audios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/japa-audios"] });
      toast({ title: "Success", description: "Japa audio deleted successfully" });
    },
  });

  const handlePlay = (japaAudio: JapaAudio) => {
    if (playingId === japaAudio.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.src = japaAudio.url;
      audio.play();
      setPlayingId(japaAudio.id);
      audio.onended = () => setPlayingId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadProgress(true);
    try {
      const response = await fetch("/api/admin/japa-audios/upload", {
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
    
    const url = inputMethod === "upload" 
      ? uploadedFileUrl
      : formData.get("url") as string;

    if (!url) {
      toast({ title: "Error", description: "Please provide a URL or upload a file", variant: "destructive" });
      return;
    }

    const data = {
      name: formData.get("name"),
      url: url,
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : null,
      description: formData.get("description") || null,
      isDefault: formData.get("isDefault") === "on",
    };

    if (editingAudio) {
      updateMutation.mutate({ id: editingAudio.id, data });
    } else {
      createMutation.mutate(data);
    }
    setUploadedFileUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif">Japa Audios Management</h1>
          <p className="text-muted-foreground">Manage audio tracks for japa meditation</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-japa-audio">
              <Plus className="h-4 w-4 mr-2" />
              Add Audio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Japa Audio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Audio Name</Label>
                <Input id="name" name="name" required data-testid="input-name" placeholder="e.g., Om Chanting" />
              </div>

              <Tabs value={inputMethod} onValueChange={setInputMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" data-testid="tab-upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url" data-testid="tab-url">
                    <Link className="h-4 w-4 mr-2" />
                    Provide URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-2 mt-4">
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
                    <p className="text-sm text-green-600 dark:text-green-400">
                      File uploaded successfully
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-2 mt-4">
                  <Label htmlFor="url">Audio URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com/audio.mp3"
                    data-testid="input-url"
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input id="duration" name="duration" type="number" data-testid="input-duration" placeholder="e.g., 300" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" data-testid="input-description" placeholder="Brief description of the audio" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isDefault" name="isDefault" data-testid="switch-default" />
                <Label htmlFor="isDefault">Set as Default</Label>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingAudio ? "Update Audio" : "Add Audio"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audios.map((japaAudio) => (
          <Card key={japaAudio.id} className="p-4 space-y-3" data-testid={`card-japa-audio-${japaAudio.id}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{japaAudio.name}</h3>
                {japaAudio.isDefault && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Default</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handlePlay(japaAudio)}
                  data-testid={`button-play-${japaAudio.id}`}
                >
                  {playingId === japaAudio.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingAudio(japaAudio)}
                  data-testid={`button-edit-${japaAudio.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(japaAudio.id)}
                  data-testid={`button-delete-${japaAudio.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            {japaAudio.description && (
              <p className="text-sm text-muted-foreground">{japaAudio.description}</p>
            )}
            {japaAudio.duration && (
              <p className="text-xs text-muted-foreground">
                Duration: {Math.floor(japaAudio.duration / 60)}:{(japaAudio.duration % 60).toString().padStart(2, '0')}
              </p>
            )}
          </Card>
        ))}
      </div>

      {editingAudio && (
        <Dialog open={!!editingAudio} onOpenChange={() => setEditingAudio(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Japa Audio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Audio Name</Label>
                <Input id="edit-name" name="name" required defaultValue={editingAudio.name} data-testid="input-edit-name" />
              </div>

              <Tabs value={inputMethod} onValueChange={setInputMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <Link className="h-4 w-4 mr-2" />
                    Provide URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-2 mt-4">
                  <Label htmlFor="edit-audio-file">Upload Audio File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-audio-file"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      disabled={uploadProgress}
                    />
                    {uploadProgress && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  {uploadedFileUrl && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      New file uploaded successfully
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-2 mt-4">
                  <Label htmlFor="edit-url">Audio URL</Label>
                  <Input
                    id="edit-url"
                    name="url"
                    type="url"
                    defaultValue={editingAudio.url}
                    placeholder="https://example.com/audio.mp3"
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (seconds)</Label>
                <Input id="edit-duration" name="duration" type="number" defaultValue={editingAudio.duration || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" defaultValue={editingAudio.description || ""} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="edit-isDefault" name="isDefault" defaultChecked={editingAudio.isDefault} />
                <Label htmlFor="edit-isDefault">Set as Default</Label>
              </div>

              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Audio"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
