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
import { Plus, Edit, Trash2, Upload, Loader2, BookOpen, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { MahapuranPdf } from "@shared/schema";

export default function MahapuranPdfsManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<MahapuranPdf | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    languageCode: "",
    languageName: "",
    title: "Shreemad Bhagwat Mahapuran",
    description: "",
    pdfUrl: "",
    pdfKey: "",
    fileSize: null as number | null,
    totalSkandas: 12,
    totalChapters: null as number | null,
    orderIndex: 0,
  });

  const { data: pdfs, isLoading } = useQuery<MahapuranPdf[]>({
    queryKey: ["/api/mahapuran-pdfs"],
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
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please check if you're logged in as admin.");
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
        description: "PDF uploaded successfully. Please fill in the language details.",
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
      return apiRequest("POST", "/api/mahapuran-pdfs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-pdfs"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Mahapuran PDF created successfully",
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
      return apiRequest("PATCH", `/api/mahapuran-pdfs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-pdfs"] });
      setEditingPdf(null);
      resetForm();
      toast({
        title: "Success",
        description: "Mahapuran PDF updated successfully",
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
      return apiRequest("DELETE", `/api/mahapuran-pdfs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mahapuran-pdfs"] });
      toast({
        title: "Success",
        description: "Mahapuran PDF deleted successfully",
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
      languageCode: "",
      languageName: "",
      title: "Shreemad Bhagwat Mahapuran",
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
    
    if (!formData.pdfUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a PDF file first",
      });
      return;
    }

    if (editingPdf) {
      updateMutation.mutate({ id: editingPdf.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (pdf: MahapuranPdf) => {
    setEditingPdf(pdf);
    setFormData({
      languageCode: pdf.languageCode,
      languageName: pdf.languageName,
      title: pdf.title,
      description: pdf.description || "",
      pdfUrl: pdf.pdfUrl || "",
      pdfKey: pdf.pdfKey || "",
      fileSize: pdf.fileSize,
      totalSkandas: pdf.totalSkandas,
      totalChapters: pdf.totalChapters,
      orderIndex: pdf.orderIndex,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this PDF? This action cannot be undone.")) {
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
          <h1 className="text-3xl font-bold">Mahapuran PDFs Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage Shreemad Bhagwat Mahapuran PDFs in different languages
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-pdf">
          <Plus className="h-4 w-4 mr-2" />
          Add PDF
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Language</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Chapters</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pdfs && pdfs.length > 0 ? (
              pdfs.map((pdf) => (
                <TableRow key={pdf.id} data-testid={`row-pdf-${pdf.id}`}>
                  <TableCell className="font-medium">{pdf.languageName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{pdf.languageCode.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{pdf.title}</TableCell>
                  <TableCell>
                    {pdf.fileSize ? `${(pdf.fileSize / (1024 * 1024)).toFixed(2)} MB` : "N/A"}
                  </TableCell>
                  <TableCell>{pdf.totalChapters || "N/A"}</TableCell>
                  <TableCell>
                    {pdf.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {pdf.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(pdf.pdfUrl!, "_blank")}
                          data-testid={`button-view-${pdf.id}`}
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pdf)}
                        data-testid={`button-edit-${pdf.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pdf.id)}
                        data-testid={`button-delete-${pdf.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No PDFs found. Add your first PDF to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen || editingPdf !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingPdf(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPdf ? "Edit Mahapuran PDF" : "Add New Mahapuran PDF"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingPdf && (
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
                <Label htmlFor="language-code">Language Code *</Label>
                <Input
                  id="language-code"
                  value={formData.languageCode}
                  onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
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
                placeholder="Description of this PDF version..."
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
                  setEditingPdf(null);
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
                  editingPdf ? "Update PDF" : "Create PDF"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
