import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Shield, Search, Users as UsersIcon, Crown, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { format } from "date-fns";

const USERS_PER_PAGE = 50;

export default function UserManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "admin" | "regular">("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User admin status updated",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
  });

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply filter
    if (filterType === "admin") {
      filtered = filtered.filter(u => u.isAdmin);
    } else if (filterType === "regular") {
      filtered = filtered.filter(u => !u.isAdmin);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.email?.toLowerCase().includes(query) ||
        u.firstName?.toLowerCase().includes(query) ||
        u.lastName?.toLowerCase().includes(query) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, filterType, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const adminUsers = users.filter(u => u.isAdmin);
  const regularUsers = users.filter(u => !u.isAdmin);

  const UserCard = ({ user }: { user: User }) => (
    <div key={user.id} className="p-4 flex items-center justify-between gap-4" data-testid={`user-row-${user.id}`}>
      <div className="flex items-center gap-4 flex-1">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
          <AvatarFallback className="text-lg">
            {user.firstName?.[0] || user.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email || "Unknown User"}
            </p>
            {user.isAdmin && (
              <Badge variant="default" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.lastLogin && (
            <p className="text-xs text-muted-foreground">
              Last login: {format(new Date(user.lastLogin), "PPp")}
            </p>
          )}
          {user.createdAt && (
            <p className="text-xs text-muted-foreground">
              Joined: {format(new Date(user.createdAt), "PP")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Admin</span>
          <Switch
            checked={user.isAdmin}
            onCheckedChange={(checked) =>
              toggleAdminMutation.mutate({ userId: user.id, isAdmin: checked })
            }
            data-testid={`switch-admin-${user.id}`}
          />
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            if (confirm(`Are you sure you want to delete ${user.firstName || user.email}?`)) {
              deleteUserMutation.mutate(user.id);
            }
          }}
          data-testid={`button-delete-${user.id}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">User Management</h1>
        <p className="text-muted-foreground">Manage users, permissions, and analytics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold" data-testid="stat-total-users">{users.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admin Users</p>
              <p className="text-3xl font-bold" data-testid="stat-admin-users">{adminUsers.length}</p>
            </div>
            <Crown className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-3xl font-bold" data-testid="stat-regular-users">{regularUsers.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-users"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            data-testid="filter-all"
          >
            All ({users.length})
          </Button>
          <Button
            variant={filterType === "admin" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("admin")}
            data-testid="filter-admin"
          >
            Admins ({adminUsers.length})
          </Button>
          <Button
            variant={filterType === "regular" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("regular")}
            data-testid="filter-regular"
          >
            Regular ({regularUsers.length})
          </Button>
        </div>
      </div>

      {/* Users Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" data-testid="tab-all-users">All Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="admins" data-testid="tab-admin-users">Admin Analytics ({adminUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          <Card>
            <div className="divide-y">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => <UserCard key={user.id} user={user} />)
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching your criteria</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          data-testid={`button-page-${page}`}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="admins" className="mt-6 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Admin Users Overview</h3>
            <div className="space-y-4">
              {adminUsers.length > 0 ? (
                adminUsers.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`admin-card-${admin.id}`}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={admin.profileImageUrl || undefined} className="object-cover" />
                        <AvatarFallback>
                          {admin.firstName?.[0] || admin.email?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {admin.firstName && admin.lastName
                            ? `${admin.firstName} ${admin.lastName}`
                            : admin.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                        {admin.lastLogin && (
                          <p className="text-xs text-muted-foreground">
                            Last active: {format(new Date(admin.lastLogin), "PPp")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="default">
                      <Shield className="h-3 w-3 mr-1" />
                      Administrator
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No admin users found</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Admin Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Admins</span>
                <span className="font-semibold">{adminUsers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Admins (logged in)</span>
                <span className="font-semibold">{adminUsers.filter(a => a.lastLogin).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Admin Permissions</span>
                <span className="font-semibold">Full Access</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
