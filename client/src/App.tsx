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
import { NotificationBell } from "@/components/NotificationBell";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { AlarmDialog } from "@/components/AlarmDialog";
import { useAlarmMonitor } from "@/hooks/use-alarm-monitor";
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
import AlarmsNew from "@/pages/AlarmsNew";
import SettingsConnected from "@/pages/SettingsConnected";
import MahapuranLibrary from "@/pages/MahapuranLibrary";
import MahapuranSkandas from "@/pages/MahapuranSkandas";
import MahapuranChapters from "@/pages/MahapuranChapters";
import MahapuranChapterRead from "@/pages/MahapuranChapterRead";
import Scriptures from "@/pages/Scriptures";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Legal from "@/pages/Legal";
import QuestionsAnswers from "@/pages/QuestionsAnswers";
import BhavishyaMalika from "@/pages/BhavishyaMalika";
import DivineExperiences from "@/pages/DivineExperiences";
import Articles from "@/pages/Articles";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import MediaManagement from "@/pages/admin/MediaManagement";
import MediaCategoriesManagement from "@/pages/admin/MediaCategoriesManagement";
import ScripturesManagement from "@/pages/admin/ScripturesManagement";
import AlarmSoundsManagement from "@/pages/admin/AlarmSoundsManagement";
import JapaAudiosManagement from "@/pages/admin/JapaAudiosManagement";
import MahapuranPdfsManagement from "@/pages/admin/MahapuranPdfsManagement";
import TrisandhyaPdfsManagement from "@/pages/admin/TrisandhyaPdfsManagement";
import NotificationsManagement from "@/pages/admin/NotificationsManagement";
import NotFound from "@/pages/not-found";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/media" component={MediaManagement} />
      <Route path="/admin/media-categories" component={MediaCategoriesManagement} />
      <Route path="/admin/scriptures/:titleId/skanda/:skandaId" component={MahapuranChapters} />
      <Route path="/admin/scriptures/:titleId" component={MahapuranSkandas} />
      <Route path="/admin/scriptures" component={ScripturesManagement} />
      <Route path="/admin/alarm-sounds" component={AlarmSoundsManagement} />
      <Route path="/admin/japa-audios" component={JapaAudiosManagement} />
      <Route path="/admin/mahapuran-pdfs" component={MahapuranPdfsManagement} />
      <Route path="/admin/trisandhya-pdfs" component={TrisandhyaPdfsManagement} />
      <Route path="/admin/notifications" component={NotificationsManagement} />
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
      <Route path="/mahapuran" component={MahapuranLibrary} />
      <Route path="/mahapuran/:titleId" component={MahapuranSkandas} />
      <Route path="/mahapuran/:titleId/skanda/:skandaId" component={MahapuranChapters} />
      <Route path="/mahapuran/:titleId/skanda/:skandaId/chapter/:chapterId" component={MahapuranChapterRead} />
      <Route path="/scriptures" component={Scriptures} />
      <Route path="/scriptures/:titleId" component={MahapuranSkandas} />
      <Route path="/scriptures/:titleId/skanda/:skandaId" component={MahapuranChapters} />
      <Route path="/scriptures/:titleId/skanda/:skandaId/chapter/:chapterId" component={MahapuranChapterRead} />
      <Route path="/progress" component={ProgressConnected} />
      <Route path="/alarms" component={AlarmsConnected} />
      <Route path="/alarms-new" component={AlarmsNew} />
      <Route path="/settings" component={SettingsConnected} />
      <Route path="/divine-experiences" component={DivineExperiences} />
      <Route path="/questions" component={QuestionsAnswers} />
      <Route path="/articles" component={Articles} />
      <Route path="/bhavishya-malika" component={BhavishyaMalika} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/legal" component={Legal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, isAdmin } = useAuth();
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");
  const { activeAlarm, dismissAlarm, snoozeAlarm, volume } = useAlarmMonitor();

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
            <div className="flex items-center gap-2">
              {!isAdminRoute && <NotificationBell />}
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
      
      <AlarmDialog
        isOpen={!!activeAlarm}
        alarmType={activeAlarm?.type || "pratah"}
        alarmTime={activeAlarm?.time || ""}
        alarmSound={activeAlarm?.sound}
        volume={volume}
        onDismiss={dismissAlarm}
        onSnooze={snoozeAlarm}
      />
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
        <AudioPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <GlobalAudioPlayer />
          </TooltipProvider>
        </AudioPlayerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
