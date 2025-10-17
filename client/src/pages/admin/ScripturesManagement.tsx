import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, BookOpen, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { MahapuranTitle } from "@shared/schema";
import { useLocation } from "wouter";

export default function ScripturesManagementSimple() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<MahapuranTitle | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "Shreemad Bhagwat Mahapuran",
    language: "",
    languageName: "",
    description: "",
    pdfUrl: "",
    pdfKey: "",
    fileSize: null as number | null,
    totalSkandas: 12,
    totalChapters: null as number | null,
    orderIndex: 0,
  });

  const { data: titles, isLoading } = useQuery<MahapuranTitle[]>({
    queryKey: ["/api/mahapuran-titles"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("pdf", file);
      
      const response = await fetch("/api/mahapuran-pdfs/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to upload PDF";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        pdfUrl: data.pdfUrl,
        pdfKey: data.pdfKey,
        fileSize: data.fileSize,
      }));
      setUploadingFile(null);
      toast({
        title: "Success",
        description: "PDF uploaded successfully. Please fill in the details.",
      });
    },
    onError: (error: Error) => {
      setUploadingFile(null);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/mahapuran-titles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-titles"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Scripture title created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/admin/mahapuran-titles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-titles"] });
      setEditingTitle(null);
      resetForm();
      toast({
        title: "Success",
        description: "Scripture title updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/mahapuran-titles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-titles"] });
      toast({
        title: "Success",
        description: "Scripture title deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "Shreemad Bhagwat Mahapuran",
      language: "",
      languageName: "",
      description: "",
      pdfUrl: "",
      pdfKey: "",
      fileSize: null,
      totalSkandas: 12,
      totalChapters: null,
      orderIndex: 0,
    });
    setUploadingFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(file);
      uploadMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pdfUrl && !editingTitle) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a PDF file first",
      });
      return;
    }

    if (editingTitle) {
      updateMutation.mutate({ id: editingTitle.id, data: { ...formData, collectionType: 'other' } });
    } else {
      createMutation.mutate({ ...formData, collectionType: 'other' });
    }
  };

  const handleEdit = (title: MahapuranTitle) => {
    setEditingTitle(title);
    setFormData({
      title: title.title,
      language: title.language,
      languageName: title.language, // Use language code as fallback for now
      description: title.description || "",
      pdfUrl: "", // PDFs not stored in titles currently
      pdfKey: "",
      fileSize: null,
      totalSkandas: title.totalSkandas,
      totalChapters: null,
      orderIndex: title.orderIndex,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this scripture? All associated skandas and chapters will also be deleted.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scriptures Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage sacred scripture titles and their content
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-scripture">
          <Plus className="h-4 w-4 mr-2" />
          Add Scripture
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Skandas</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {titles && titles.length > 0 ? (
              titles.map((title) => (
                <TableRow key={title.id} data-testid={`row-scripture-${title.id}`}>
                  <TableCell className="font-medium">{title.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{title.language.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {title.description || "No description"}
                  </TableCell>
                  <TableCell>{title.totalSkandas}</TableCell>
                  <TableCell>{title.orderIndex}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/admin/scriptures/${title.id}`)}
                        data-testid={`button-manage-${title.id}`}
                        title="Manage Skandas & Chapters"
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(title)}
                        data-testid={`button-edit-${title.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(title.id)}
                        data-testid={`button-delete-${title.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No scripture titles found. Add your first scripture to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen || editingTitle !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingTitle(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTitle ? "Edit Scripture Title" : "Add New Scripture Title"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingTitle && (
              <div className="space-y-2">
                <Label htmlFor="pdf-file">PDF File *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="pdf-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={uploadMutation.isPending}
                    data-testid="input-pdf-file"
                  />
                  {uploadMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                {formData.pdfUrl && (
                  <p className="text-sm text-green-600">✓ PDF uploaded successfully</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language Code *</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="e.g., en, hin, guj"
                  required
                  data-testid="input-language-code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language-name">Language Name *</Label>
                <Input
                  id="language-name"
                  value={formData.languageName}
                  onChange={(e) => setFormData({ ...formData, languageName: e.target.value })}
                  placeholder="e.g., English, Hindi, Gujarati"
                  required
                  data-testid="input-language-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Shreemad Bhagwat Mahapuran"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of this scripture..."
                rows={3}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-skandas">Total Skandas</Label>
                <Input
                  id="total-skandas"
                  type="number"
                  value={formData.totalSkandas}
                  onChange={(e) => setFormData({ ...formData, totalSkandas: parseInt(e.target.value) })}
                  data-testid="input-total-skandas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-chapters">Total Chapters</Label>
                <Input
                  id="total-chapters"
                  type="number"
                  value={formData.totalChapters || ""}
                  onChange={(e) => setFormData({ ...formData, totalChapters: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Optional"
                  data-testid="input-total-chapters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-index">Display Order</Label>
                <Input
                  id="order-index"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                  data-testid="input-order-index"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingTitle(null);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingTitle ? "Update Scripture" : "Create Scripture"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
