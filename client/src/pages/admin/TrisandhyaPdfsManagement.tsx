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
import type { TrisandhyaPdf } from "@shared/schema";

export default function TrisandhyaPdfsManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<TrisandhyaPdf | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    languageName: "",
    description: "",
    pdfUrl: "",
    pdfKey: "",
    fileSize: null as number | null,
    orderIndex: 0,
  });

  const { data: pdfs, isLoading } = useQuery<TrisandhyaPdf[]>({
    queryKey: ["/api/trisandhya-pdfs"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("pdf", file);
      
      const response = await fetch("/api/trisandhya-pdfs/upload", {
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
      return apiRequest("POST", "/api/trisandhya-pdfs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trisandhya-pdfs"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Trisandhya PDF created successfully",
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
      return apiRequest("PATCH", `/api/trisandhya-pdfs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trisandhya-pdfs"] });
      setEditingPdf(null);
      resetForm();
      toast({
        title: "Success",
        description: "Trisandhya PDF updated successfully",
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
      return apiRequest("DELETE", `/api/trisandhya-pdfs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trisandhya-pdfs"] });
      toast({
        title: "Success",
        description: "Trisandhya PDF deleted successfully",
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
      languageName: "",
      description: "",
      pdfUrl: "",
      pdfKey: "",
      fileSize: null,
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

  const handleEdit = (pdf: TrisandhyaPdf) => {
    setEditingPdf(pdf);
    setFormData({
      languageName: pdf.languageName,
      description: pdf.description || "",
      pdfUrl: pdf.pdfUrl || "",
      pdfKey: pdf.pdfKey || "",
      fileSize: pdf.fileSize,
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
          <h1 className="text-3xl font-bold">Trisandhya Path PDFs Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage Trisandhya Path PDFs in different languages
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-trisandhya-pdf">
          <Plus className="h-4 w-4 mr-2" />
          Add PDF
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Language</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pdfs && pdfs.length > 0 ? (
              pdfs.map((pdf) => (
                <TableRow key={pdf.id} data-testid={`row-trisandhya-pdf-${pdf.id}`}>
                  <TableCell className="font-medium">{pdf.languageName}</TableCell>
                  <TableCell className="max-w-xs truncate">{pdf.description || "—"}</TableCell>
                  <TableCell>
                    {pdf.fileSize ? `${(pdf.fileSize / (1024 * 1024)).toFixed(2)} MB` : "N/A"}
                  </TableCell>
                  <TableCell>{pdf.orderIndex}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {pdf.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(pdf.pdfUrl!, "_blank")}
                          data-testid={`button-view-trisandhya-${pdf.id}`}
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pdf)}
                        data-testid={`button-edit-trisandhya-${pdf.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pdf.id)}
                        data-testid={`button-delete-trisandhya-${pdf.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No PDFs found. Add your first PDF to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Frontend Preview Section */}
      {pdfs && pdfs.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Frontend Preview</h2>
              <p className="text-sm text-muted-foreground mt-1">
                This is how the PDFs will appear to users on the Daily Sadhna page
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pdfs.map((pdf) => (
                <Card
                  key={pdf.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 bg-card dark:bg-card border-border dark:border-border"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <h3 className="text-xl font-semibold text-foreground dark:text-foreground">
                            {pdf.languageName}
                          </h3>
                        </div>
                        
                        {pdf.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {pdf.description}
                          </p>
                        )}
                        
                        {pdf.fileSize && (
                          <p className="text-xs text-muted-foreground">
                            File size: {(pdf.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-border dark:border-border">
                      {pdf.pdfUrl ? (
                        <>
                          <Button
                            onClick={() => window.open(pdf.pdfUrl!, '_blank')}
                            className="w-full"
                            variant="default"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Read Online
                          </Button>
                          
                          <Button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = pdf.pdfUrl!;
                              link.download = `Trisandhya_Path_${pdf.languageName}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-center text-muted-foreground py-2">
                          PDF will be available soon
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

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
              {editingPdf ? "Edit Trisandhya PDF" : "Add New Trisandhya PDF"}
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
                    data-testid="input-trisandhya-pdf-file"
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

            <div className="space-y-2">
              <Label htmlFor="language-name">Language Name *</Label>
              <Input
                id="language-name"
                value={formData.languageName}
                onChange={(e) => setFormData({ ...formData, languageName: e.target.value })}
                placeholder="e.g., English, Hindi, Odia, Sanskrit"
                required
                data-testid="input-trisandhya-language-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of this Trisandhya Path PDF..."
                rows={3}
                data-testid="input-trisandhya-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-index">Display Order</Label>
              <Input
                id="order-index"
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                data-testid="input-trisandhya-order-index"
              />
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
                data-testid="button-trisandhya-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-trisandhya-submit"
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
