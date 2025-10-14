import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Pencil } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ScriptureContent } from "@shared/schema";

export default function ScriptureManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingScripture, setEditingScripture] = useState<ScriptureContent | null>(null);
  
  const { data: scriptures = [] } = useQuery<ScriptureContent[]>({
    queryKey: ["/api/scriptures"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/scriptures", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scriptures"] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Scripture created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/scriptures/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scriptures"] });
      setEditingScripture(null);
      toast({ title: "Success", description: "Scripture updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/scriptures/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scriptures"] });
      toast({ title: "Success", description: "Scripture deleted successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      chapterNumber: parseInt(formData.get("chapterNumber") as string),
      title: formData.get("title"),
      content: formData.get("content"),
      summary: formData.get("summary"),
    };

    if (editingScripture) {
      updateMutation.mutate({ id: editingScripture.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif">Scripture Management</h1>
          <p className="text-muted-foreground">Manage Mahapuran Path scripture chapters</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-scripture">
              <Plus className="h-4 w-4 mr-2" />
              Add Scripture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Scripture</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chapterNumber">Chapter Number</Label>
                <Input id="chapterNumber" name="chapterNumber" type="number" required data-testid="input-chapter-number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required data-testid="input-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" rows={8} required data-testid="textarea-content" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary (Optional)</Label>
                <Textarea id="summary" name="summary" rows={3} data-testid="textarea-summary" />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit">
                Create Scripture
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="divide-y">
          {scriptures.map((scripture) => (
            <div key={scripture.id} className="p-4 flex items-center justify-between" data-testid={`scripture-item-${scripture.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                    Chapter {scripture.chapterNumber}
                  </span>
                  <p className="font-medium">{scripture.title}</p>
                </div>
                {scripture.summary && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{scripture.summary}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={editingScripture?.id === scripture.id} onOpenChange={(open) => !open && setEditingScripture(null)}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setEditingScripture(scripture)} data-testid={`button-edit-${scripture.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Scripture</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-chapterNumber">Chapter Number</Label>
                        <Input id="edit-chapterNumber" name="chapterNumber" type="number" defaultValue={editingScripture?.chapterNumber} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input id="edit-title" name="title" defaultValue={editingScripture?.title} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-content">Content</Label>
                        <Textarea id="edit-content" name="content" rows={8} defaultValue={editingScripture?.content} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-summary">Summary (Optional)</Label>
                        <Textarea id="edit-summary" name="summary" rows={3} defaultValue={editingScripture?.summary || ""} />
                      </div>
                      <Button type="submit" className="w-full">Update Scripture</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this scripture?")) {
                      deleteMutation.mutate(scripture.id);
                    }
                  }}
                  data-testid={`button-delete-${scripture.id}`}
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
