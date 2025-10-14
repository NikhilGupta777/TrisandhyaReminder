import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users, Music, BookOpen, TrendingUp, Book } from "lucide-react";
import type { User, MediaContent, ScriptureContent, SadhanaContent } from "@shared/schema";

export default function AdminDashboard() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: media = [] } = useQuery<MediaContent[]>({
    queryKey: ["/api/media"],
  });

  const { data: scriptures = [] } = useQuery<ScriptureContent[]>({
    queryKey: ["/api/scriptures"],
  });

  const { data: sadhanaContent = [] } = useQuery<SadhanaContent[]>({
    queryKey: ["/api/sadhana-content"],
  });

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.isAdmin).length;
  const regularUsers = totalUsers - adminUsers;
  const totalMedia = media.length;
  const totalScriptures = scriptures.length;
  const totalSadhanaContent = sadhanaContent.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your Trisandhya Companion platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold" data-testid="stat-total-users">{totalUsers}</p>
            </div>
            <Users className="h-6 w-6 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Regular Users</p>
              <p className="text-2xl font-bold" data-testid="stat-regular-users">{regularUsers}</p>
            </div>
            <Users className="h-6 w-6 text-accent" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Admin Users</p>
              <p className="text-2xl font-bold" data-testid="stat-admin-users">{adminUsers}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Media Items</p>
              <p className="text-2xl font-bold" data-testid="stat-media-items">{totalMedia}</p>
            </div>
            <Music className="h-6 w-6 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Scriptures</p>
              <p className="text-2xl font-bold" data-testid="stat-scriptures">{totalScriptures}</p>
            </div>
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Sadhana Items</p>
              <p className="text-2xl font-bold" data-testid="stat-sadhana-content">{totalSadhanaContent}</p>
            </div>
            <Book className="h-6 w-6 text-primary" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Quick Actions
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">• Manage users and permissions</p>
            <p className="text-muted-foreground">• Add or edit media content</p>
            <p className="text-muted-foreground">• Update scripture chapters</p>
            <p className="text-muted-foreground">• View platform analytics</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Platform activity will appear here</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
