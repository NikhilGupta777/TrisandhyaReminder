import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Pencil } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SadhanaContent } from "@shared/schema";

export default function SadhanaContentManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<SadhanaContent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: allContent = [] } = useQuery<SadhanaContent[]>({
    queryKey: ["/api/sadhana-content"],
  });

  const displayedContent = selectedCategory === "all" 
    ? allContent 
    : allContent.filter(c => c.category === selectedCategory);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/sadhana-content", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sadhana-content"] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Sadhana content created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/sadhana-content/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sadhana-content"] });
      setEditingContent(null);
      toast({ title: "Success", description: "Sadhana content updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/sadhana-content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sadhana-content"] });
      toast({ title: "Success", description: "Sadhana content deleted successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      category: formData.get("category"),
      sectionTitle: formData.get("sectionTitle"),
      orderNumber: parseInt(formData.get("orderNumber") as string),
      sanskritText: formData.get("sanskritText") || null,
      englishTranslation: formData.get("englishTranslation") || null,
      description: formData.get("description") || null,
      repeatCount: formData.get("repeatCount") || null,
      contentType: formData.get("contentType"),
      additionalNotes: formData.get("additionalNotes") || null,
    };

    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif">Sadhana Content Management</h1>
          <p className="text-muted-foreground">Manage mantras, prayers, and instructions for Sadhana Guide</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-sadhana-content">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Sadhana Content</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trisandhya">Trisandhya Path</SelectItem>
                      <SelectItem value="mahapuran">Mahapuran</SelectItem>
                      <SelectItem value="jap">Madhav Jap</SelectItem>
                      <SelectItem value="timing">Sacred Timings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select name="contentType" required>
                    <SelectTrigger data-testid="select-content-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mantra">Mantra</SelectItem>
                      <SelectItem value="stotram">Stotram</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="instruction">Instruction</SelectItem>
                      <SelectItem value="timing">Timing Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionTitle">Section Title</Label>
                  <Input id="sectionTitle" name="sectionTitle" required data-testid="input-section-title" placeholder="e.g., Gayatri Mantra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input id="orderNumber" name="orderNumber" type="number" required data-testid="input-order-number" placeholder="1, 2, 3..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sanskritText">Sanskrit Text (Optional)</Label>
                <Textarea id="sanskritText" name="sanskritText" rows={4} data-testid="textarea-sanskrit" placeholder="Enter Sanskrit text..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="englishTranslation">English Translation (Optional)</Label>
                <Textarea id="englishTranslation" name="englishTranslation" rows={3} data-testid="textarea-translation" placeholder="Enter English meaning..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" rows={2} data-testid="textarea-description" placeholder="Brief description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repeatCount">Repeat Count (Optional)</Label>
                  <Input id="repeatCount" name="repeatCount" data-testid="input-repeat-count" placeholder="e.g., 3 times, 7 times" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Input id="additionalNotes" name="additionalNotes" data-testid="input-notes" placeholder="Any extra info..." />
                </div>
              </div>

              <Button type="submit" className="w-full" data-testid="button-submit">
                Create Content
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Label>Filter by Category:</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="trisandhya">Trisandhya Path</SelectItem>
            <SelectItem value="mahapuran">Mahapuran</SelectItem>
            <SelectItem value="jap">Madhav Jap</SelectItem>
            <SelectItem value="timing">Sacred Timings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="divide-y">
          {displayedContent.map((content) => (
            <div key={content.id} className="p-4 flex items-start justify-between gap-4" data-testid={`content-item-${content.id}`}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                    #{content.orderNumber}
                  </span>
                  <span className="text-xs bg-accent px-2 py-1 rounded capitalize">
                    {content.category}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                    {content.contentType}
                  </span>
                </div>
                <h3 className="font-semibold">{content.sectionTitle}</h3>
                {content.sanskritText && (
                  <p className="text-sm font-serif text-muted-foreground line-clamp-2">{content.sanskritText}</p>
                )}
                {content.englishTranslation && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{content.englishTranslation}</p>
                )}
                {content.repeatCount && (
                  <p className="text-xs text-primary">Repeat: {content.repeatCount}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={editingContent?.id === content.id} onOpenChange={(open) => !open && setEditingContent(null)}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setEditingContent(content)} data-testid={`button-edit-${content.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Sadhana Content</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Category</Label>
                          <Select name="category" defaultValue={editingContent?.category} required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trisandhya">Trisandhya Path</SelectItem>
                              <SelectItem value="mahapuran">Mahapuran</SelectItem>
                              <SelectItem value="jap">Madhav Jap</SelectItem>
                              <SelectItem value="timing">Sacred Timings</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-contentType">Content Type</Label>
                          <Select name="contentType" defaultValue={editingContent?.contentType || undefined} required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mantra">Mantra</SelectItem>
                              <SelectItem value="stotram">Stotram</SelectItem>
                              <SelectItem value="prayer">Prayer</SelectItem>
                              <SelectItem value="instruction">Instruction</SelectItem>
                              <SelectItem value="timing">Timing Info</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-sectionTitle">Section Title</Label>
                          <Input id="edit-sectionTitle" name="sectionTitle" defaultValue={editingContent?.sectionTitle} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-orderNumber">Order Number</Label>
                          <Input id="edit-orderNumber" name="orderNumber" type="number" defaultValue={editingContent?.orderNumber} required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-sanskritText">Sanskrit Text (Optional)</Label>
                        <Textarea id="edit-sanskritText" name="sanskritText" rows={4} defaultValue={editingContent?.sanskritText || ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-englishTranslation">English Translation (Optional)</Label>
                        <Textarea id="edit-englishTranslation" name="englishTranslation" rows={3} defaultValue={editingContent?.englishTranslation || ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description (Optional)</Label>
                        <Textarea id="edit-description" name="description" rows={2} defaultValue={editingContent?.description || ""} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-repeatCount">Repeat Count (Optional)</Label>
                          <Input id="edit-repeatCount" name="repeatCount" defaultValue={editingContent?.repeatCount || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-additionalNotes">Additional Notes (Optional)</Label>
                          <Input id="edit-additionalNotes" name="additionalNotes" defaultValue={editingContent?.additionalNotes || ""} />
                        </div>
                      </div>

                      <Button type="submit" className="w-full">Update Content</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this content?")) {
                      deleteMutation.mutate(content.id);
                    }
                  }}
                  data-testid={`button-delete-${content.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {displayedContent.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No sadhana content found. Add your first item to get started!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
