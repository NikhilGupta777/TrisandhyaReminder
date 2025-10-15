import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Pencil, Book, BookOpen, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MahapuranTitle, MahapuranSkanda, MahapuranChapter } from "@shared/schema";

export default function MahapuranManagement() {
  const { toast } = useToast();
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);
  const [selectedSkandaId, setSelectedSkandaId] = useState<string | null>(null);
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false);
  const [isSkandaDialogOpen, setIsSkandaDialogOpen] = useState(false);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<MahapuranTitle | null>(null);
  const [editingSkanda, setEditingSkanda] = useState<MahapuranSkanda | null>(null);
  const [editingChapter, setEditingChapter] = useState<MahapuranChapter | null>(null);

  const { data: titles = [] } = useQuery<MahapuranTitle[]>({
    queryKey: ["/api/mahapuran-titles"],
  });

  const { data: skandas = [] } = useQuery<MahapuranSkanda[]>({
    queryKey: ["/api/mahapuran-skandas", selectedTitleId],
    enabled: !!selectedTitleId,
  });

  const { data: chapters = [] } = useQuery<MahapuranChapter[]>({
    queryKey: ["/api/mahapuran-chapters", selectedSkandaId],
    enabled: !!selectedSkandaId,
  });

  const createTitleMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/admin/mahapuran-titles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-titles"] });
      setIsTitleDialogOpen(false);
      setEditingTitle(null);
      toast({ title: "Success", description: "Mahapuran title created successfully" });
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      await apiRequest("PATCH", `/api/admin/mahapuran-titles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-titles"] });
      setIsTitleDialogOpen(false);
      setEditingTitle(null);
      toast({ title: "Success", description: "Mahapuran title updated successfully" });
    },
  });

  const deleteTitleMutation = useMutation({
    mutationFn: async (id: string) => await apiRequest("DELETE", `/api/admin/mahapuran-titles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-titles"] });
      if (selectedTitleId) setSelectedTitleId(null);
      toast({ title: "Success", description: "Mahapuran title deleted successfully" });
    },
  });

  const createSkandaMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/admin/mahapuran-skandas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-skandas", selectedTitleId] });
      setIsSkandaDialogOpen(false);
      setEditingSkanda(null);
      toast({ title: "Success", description: "Skanda created successfully" });
    },
  });

  const updateSkandaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      await apiRequest("PATCH", `/api/admin/mahapuran-skandas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-skandas", selectedTitleId] });
      setIsSkandaDialogOpen(false);
      setEditingSkanda(null);
      toast({ title: "Success", description: "Skanda updated successfully" });
    },
  });

  const deleteSkandaMutation = useMutation({
    mutationFn: async (id: string) => await apiRequest("DELETE", `/api/admin/mahapuran-skandas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-skandas", selectedTitleId] });
      if (selectedSkandaId) setSelectedSkandaId(null);
      toast({ title: "Success", description: "Skanda deleted successfully" });
    },
  });

  const createChapterMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", "/api/admin/mahapuran-chapters", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-chapters", selectedSkandaId] });
      setIsChapterDialogOpen(false);
      setEditingChapter(null);
      toast({ title: "Success", description: "Chapter created successfully" });
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      await apiRequest("PATCH", `/api/admin/mahapuran-chapters/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-chapters", selectedSkandaId] });
      setIsChapterDialogOpen(false);
      setEditingChapter(null);
      toast({ title: "Success", description: "Chapter updated successfully" });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (id: string) => await apiRequest("DELETE", `/api/admin/mahapuran-chapters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-chapters", selectedSkandaId] });
      toast({ title: "Success", description: "Chapter deleted successfully" });
    },
  });

  const handleTitleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      language: formData.get("language"),
      description: formData.get("description") || null,
      totalSkandas: parseInt(formData.get("totalSkandas") as string) || 12,
      orderIndex: parseInt(formData.get("orderIndex") as string) || 0,
    };

    if (editingTitle) {
      updateTitleMutation.mutate({ id: editingTitle.id, data });
    } else {
      createTitleMutation.mutate(data);
    }
  };

  const handleSkandaSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      mahapuranTitleId: selectedTitleId,
      skandaNumber: parseInt(formData.get("skandaNumber") as string),
      title: formData.get("title"),
      description: formData.get("description") || null,
    };

    if (editingSkanda) {
      updateSkandaMutation.mutate({ id: editingSkanda.id, data });
    } else {
      createSkandaMutation.mutate(data);
    }
  };

  const handleChapterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      skandaId: selectedSkandaId,
      chapterNumber: parseInt(formData.get("chapterNumber") as string),
      title: formData.get("title"),
      content: formData.get("content"),
      summary: formData.get("summary") || null,
    };

    if (editingChapter) {
      updateChapterMutation.mutate({ id: editingChapter.id, data });
    } else {
      createChapterMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Mahapuran Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mahapuran Titles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Book className="h-5 w-5" />
              Mahapuran Titles
            </CardTitle>
            <Dialog open={isTitleDialogOpen} onOpenChange={setIsTitleDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingTitle(null)} data-testid="button-add-title">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTitle ? "Edit" : "Add"} Mahapuran Title</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTitleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Bhagwat Mahapuran"
                      defaultValue={editingTitle?.title || ""}
                      required
                      data-testid="input-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Language *</Label>
                    <Select name="language" defaultValue={editingTitle?.language || "en"}>
                      <SelectTrigger data-testid="select-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (EN)</SelectItem>
                        <SelectItem value="hin">Hindi (HIN)</SelectItem>
                        <SelectItem value="san">Sanskrit (SAN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="totalSkandas">Total Skandas</Label>
                    <Input
                      id="totalSkandas"
                      name="totalSkandas"
                      type="number"
                      placeholder="12"
                      defaultValue={editingTitle?.totalSkandas || 12}
                      data-testid="input-total-skandas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderIndex">Order Index</Label>
                    <Input
                      id="orderIndex"
                      name="orderIndex"
                      type="number"
                      placeholder="0"
                      defaultValue={editingTitle?.orderIndex || 0}
                      data-testid="input-order-index"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description"
                      defaultValue={editingTitle?.description || ""}
                      data-testid="textarea-description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsTitleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-submit-title">
                      {editingTitle ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {titles.map((title) => (
              <div
                key={title.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedTitleId === title.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                }`}
                onClick={() => {
                  setSelectedTitleId(title.id);
                  setSelectedSkandaId(null);
                }}
                data-testid={`title-${title.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{title.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {title.language.toUpperCase()} • {title.totalSkandas} Skandas
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitle(title);
                        setIsTitleDialogOpen(true);
                      }}
                      data-testid={`button-edit-title-${title.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this title and all its skandas/chapters?")) {
                          deleteTitleMutation.mutate(title.id);
                        }
                      }}
                      data-testid={`button-delete-title-${title.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {titles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No titles yet. Add your first Mahapuran!</p>
            )}
          </CardContent>
        </Card>

        {/* Skandas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Skandas
            </CardTitle>
            {selectedTitleId && (
              <Dialog open={isSkandaDialogOpen} onOpenChange={setIsSkandaDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setEditingSkanda(null)} data-testid="button-add-skanda">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingSkanda ? "Edit" : "Add"} Skanda</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSkandaSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="skandaNumber">Skanda Number *</Label>
                      <Input
                        id="skandaNumber"
                        name="skandaNumber"
                        type="number"
                        placeholder="1"
                        defaultValue={editingSkanda?.skandaNumber || ""}
                        required
                        data-testid="input-skanda-number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Skanda 1"
                        defaultValue={editingSkanda?.title || ""}
                        required
                        data-testid="input-skanda-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description"
                        defaultValue={editingSkanda?.description || ""}
                        data-testid="textarea-skanda-description"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsSkandaDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-submit-skanda">
                        {editingSkanda ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedTitleId ? (
              <p className="text-sm text-muted-foreground text-center py-8">Select a title to view skandas</p>
            ) : skandas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No skandas yet. Add your first skanda!</p>
            ) : (
              skandas.map((skanda) => (
                <div
                  key={skanda.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedSkandaId === skanda.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedSkandaId(skanda.id)}
                  data-testid={`skanda-${skanda.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Skanda {skanda.skandaNumber}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{skanda.title}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSkanda(skanda);
                          setIsSkandaDialogOpen(true);
                        }}
                        data-testid={`button-edit-skanda-${skanda.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this skanda and all its chapters?")) {
                            deleteSkandaMutation.mutate(skanda.id);
                          }
                        }}
                        data-testid={`button-delete-skanda-${skanda.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chapters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chapters
            </CardTitle>
            {selectedSkandaId && (
              <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setEditingChapter(null)} data-testid="button-add-chapter">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingChapter ? "Edit" : "Add"} Chapter</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChapterSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="chapterNumber">Chapter Number *</Label>
                      <Input
                        id="chapterNumber"
                        name="chapterNumber"
                        type="number"
                        placeholder="1"
                        defaultValue={editingChapter?.chapterNumber || ""}
                        required
                        data-testid="input-chapter-number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., The Questions of the Sages"
                        defaultValue={editingChapter?.title || ""}
                        required
                        data-testid="input-chapter-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        name="summary"
                        placeholder="Brief summary of the chapter"
                        defaultValue={editingChapter?.summary || ""}
                        rows={3}
                        data-testid="textarea-chapter-summary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        name="content"
                        placeholder="Full chapter content"
                        defaultValue={editingChapter?.content || ""}
                        required
                        rows={10}
                        data-testid="textarea-chapter-content"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsChapterDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-submit-chapter">
                        {editingChapter ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedSkandaId ? (
              <p className="text-sm text-muted-foreground text-center py-8">Select a skanda to view chapters</p>
            ) : chapters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No chapters yet. Add your first chapter!</p>
            ) : (
              chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="p-3 border rounded-md hover:bg-accent/50 transition-colors"
                  data-testid={`chapter-${chapter.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Chapter {chapter.chapterNumber}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{chapter.title}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChapter(chapter);
                          setIsChapterDialogOpen(true);
                        }}
                        data-testid={`button-edit-chapter-${chapter.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this chapter?")) {
                            deleteChapterMutation.mutate(chapter.id);
                          }
                        }}
                        data-testid={`button-delete-chapter-${chapter.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
