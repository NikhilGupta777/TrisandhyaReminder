import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MediaCategory } from "@shared/schema";

export default function MediaCategoriesManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MediaCategory | null>(null);
  
  const { data: categories = [] } = useQuery<MediaCategory[]>({
    queryKey: ["/api/media-categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/media-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-categories"] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Category created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/media-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-categories"] });
      setEditingCategory(null);
      toast({ title: "Success", description: "Category updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/media-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      displayName: formData.get("displayName"),
      description: formData.get("description") || null,
      orderIndex: formData.get("orderIndex") ? parseInt(formData.get("orderIndex") as string) : 0,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Media Categories</h1>
          <p className="text-muted-foreground">Manage categories for your media library</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-category">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name (ID)</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., bhajan, pravachan, katha"
                  required
                  data-testid="input-category-name"
                />
                <p className="text-xs text-muted-foreground mt-1">Lowercase, no spaces (used internally)</p>
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="e.g., Bhajan, Pravachan, Katha"
                  required
                  data-testid="input-category-display-name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Optional description"
                  data-testid="input-category-description"
                />
              </div>
              <div>
                <Label htmlFor="orderIndex">Order Index</Label>
                <Input
                  id="orderIndex"
                  name="orderIndex"
                  type="number"
                  defaultValue="0"
                  data-testid="input-category-order"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-category">
                {createMutation.isPending ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card className="p-12 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No categories yet. Add your first category above.</p>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="p-4" data-testid={`category-${category.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{category.displayName}</h3>
                  <p className="text-sm text-muted-foreground">ID: {category.name}</p>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Order: {category.orderIndex}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={editingCategory?.id === category.id} onOpenChange={(open) => !open && setEditingCategory(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                        data-testid={`button-edit-${category.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Name (ID)</Label>
                          <Input
                            id="edit-name"
                            name="name"
                            defaultValue={editingCategory?.name}
                            required
                            data-testid="input-edit-category-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-displayName">Display Name</Label>
                          <Input
                            id="edit-displayName"
                            name="displayName"
                            defaultValue={editingCategory?.displayName}
                            required
                            data-testid="input-edit-category-display-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            name="description"
                            defaultValue={editingCategory?.description || ""}
                            data-testid="input-edit-category-description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-orderIndex">Order Index</Label>
                          <Input
                            id="edit-orderIndex"
                            name="orderIndex"
                            type="number"
                            defaultValue={editingCategory?.orderIndex}
                            data-testid="input-edit-category-order"
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-update-category">
                          {updateMutation.isPending ? "Updating..." : "Update Category"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete ${category.displayName}? This will also delete all media in this category.`)) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${category.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
