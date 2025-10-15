import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import DashboardConnected from "@/pages/DashboardConnected";
import SadhanaGuide from "@/pages/SadhanaGuide";
import MediaLibraryConnected from "@/pages/MediaLibraryConnected";
import ProgressConnected from "@/pages/ProgressConnected";
import AlarmsConnected from "@/pages/AlarmsConnected";
import SettingsConnected from "@/pages/SettingsConnected";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import MediaManagement from "@/pages/admin/MediaManagement";
import MediaCategoriesManagement from "@/pages/admin/MediaCategoriesManagement";
import ScriptureManagement from "@/pages/admin/ScriptureManagement";
import SadhanaContentManagement from "@/pages/admin/SadhanaContentManagement";
import AlarmSoundsManagement from "@/pages/admin/AlarmSoundsManagement";
import JapaAudiosManagement from "@/pages/admin/JapaAudiosManagement";
import NotFound from "@/pages/not-found";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/media" component={MediaManagement} />
      <Route path="/admin/media-categories" component={MediaCategoriesManagement} />
      <Route path="/admin/scriptures" component={ScriptureManagement} />
      <Route path="/admin/sadhana-content" component={SadhanaContentManagement} />
      <Route path="/admin/alarm-sounds" component={AlarmSoundsManagement} />
      <Route path="/admin/japa-audios" component={JapaAudiosManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UserRouter() {
  return (
    <Switch>
      <Route path="/" component={DashboardConnected} />
      <Route path="/guide" component={SadhanaGuide} />
      <Route path="/media" component={MediaLibraryConnected} />
      <Route path="/progress" component={ProgressConnected} />
      <Route path="/alarms" component={AlarmsConnected} />
      <Route path="/settings" component={SettingsConnected} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, isAdmin } = useAuth();
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {isAdminRoute ? <AdminSidebar /> : <AppSidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {isAdmin && !isAdminRoute && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/admin"}
                  data-testid="button-admin-panel"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {isAdminRoute ? <AdminRouter /> : <UserRouter />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const isLoginPage = window.location.pathname === "/login";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AuthenticatedApp />;
  }

  return isLoginPage ? <Login /> : <Landing />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
