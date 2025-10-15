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
import type { AlarmSound } from "@shared/schema";

export default function AlarmSoundsManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSound, setEditingSound] = useState<AlarmSound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio] = useState(new Audio());
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<string>("upload");
  
  const { data: sounds = [] } = useQuery<AlarmSound[]>({
    queryKey: ["/api/alarm-sounds"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/alarm-sounds", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarm-sounds"] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Alarm sound created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/alarm-sounds/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarm-sounds"] });
      setEditingSound(null);
      toast({ title: "Success", description: "Alarm sound updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/alarm-sounds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarm-sounds"] });
      toast({ title: "Success", description: "Alarm sound deleted successfully" });
    },
  });

  const handlePlay = (sound: AlarmSound) => {
    if (playingId === sound.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.src = sound.url;
      audio.play();
      setPlayingId(sound.id);
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
      const response = await fetch("/api/admin/alarm-sounds/upload", {
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

    if (editingSound) {
      updateMutation.mutate({ id: editingSound.id, data });
    } else {
      createMutation.mutate(data);
    }
    setUploadedFileUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif">Alarm Sounds Management</h1>
          <p className="text-muted-foreground">Manage alarm sounds for Sandhya reminders</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-alarm-sound">
              <Plus className="h-4 w-4 mr-2" />
              Add Sound
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Alarm Sound</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sound Name</Label>
                <Input id="name" name="name" required data-testid="input-name" placeholder="e.g., Temple Bell" />
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
                    <p className="text-xs text-green-600">File uploaded successfully!</p>
                  )}
                  <p className="text-xs text-muted-foreground">Supported: MP3, WAV, OGG, AAC, FLAC (Max 50MB)</p>
                </TabsContent>

                <TabsContent value="url" className="space-y-2 mt-4">
                  <Label htmlFor="url">Sound URL</Label>
                  <Input id="url" name="url" type="url" required={inputMethod === "url"} data-testid="input-url" placeholder="https://..." />
                  <p className="text-xs text-muted-foreground">Direct link to audio file</p>
                </TabsContent>
              </Tabs>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds, optional)</Label>
                <Input id="duration" name="duration" type="number" data-testid="input-duration" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} data-testid="textarea-description" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isDefault" name="isDefault" data-testid="switch-default" />
                <Label htmlFor="isDefault">Set as default alarm sound</Label>
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit">
                Create Sound
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="divide-y">
          {sounds.map((sound) => (
            <div key={sound.id} className="p-4 flex items-center justify-between gap-4" data-testid={`sound-item-${sound.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{sound.name}</h3>
                  {sound.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
                {sound.description && (
                  <p className="text-sm text-muted-foreground mt-1">{sound.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{sound.url}</p>
                {sound.duration && (
                  <p className="text-xs text-muted-foreground">{sound.duration} seconds</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handlePlay(sound)}
                  data-testid={`button-play-${sound.id}`}
                >
                  {playingId === sound.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Dialog open={editingSound?.id === sound.id} onOpenChange={(open) => !open && setEditingSound(null)}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setEditingSound(sound)} data-testid={`button-edit-${sound.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Alarm Sound</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Sound Name</Label>
                        <Input id="edit-name" name="name" defaultValue={editingSound?.name} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-url">Sound URL</Label>
                        <Input id="edit-url" name="url" type="url" defaultValue={editingSound?.url} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-duration">Duration (seconds, optional)</Label>
                        <Input id="edit-duration" name="duration" type="number" defaultValue={editingSound?.duration || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea id="edit-description" name="description" rows={2} defaultValue={editingSound?.description || ""} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="edit-isDefault" name="isDefault" defaultChecked={editingSound?.isDefault} />
                        <Label htmlFor="edit-isDefault">Set as default alarm sound</Label>
                      </div>
                      <Button type="submit" className="w-full">Update Sound</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this sound?")) {
                      deleteMutation.mutate(sound.id);
                    }
                  }}
                  data-testid={`button-delete-${sound.id}`}
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
