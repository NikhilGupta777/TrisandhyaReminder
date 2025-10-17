import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Volume2, VolumeX, Bell, Mail, Smartphone } from "lucide-react";
import type { NotificationPreferences } from "@shared/schema";
import { useState, useEffect } from "react";

export default function Settings() {
  const { toast } = useToast();
  const [offlineMode, setOfflineMode] = useState(true);

  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      return apiRequest("PATCH", "/api/notification-preferences", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-settings" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and notifications</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Notification Preferences</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified about updates and new content
          </p>

          <Separator />

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Notification Channels
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications on this device</p>
                  </div>
                  <Switch
                    id="push"
                    checked={preferences?.pushEnabled ?? true}
                    onCheckedChange={(value) => handleToggle("pushEnabled", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-push-enabled"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inApp">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                  </div>
                  <Switch
                    id="inApp"
                    checked={preferences?.inAppEnabled ?? true}
                    onCheckedChange={(value) => handleToggle("inAppEnabled", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-inapp-enabled"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email"
                    checked={preferences?.emailEnabled ?? false}
                    onCheckedChange={(value) => handleToggle("emailEnabled", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-email-enabled"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                {preferences?.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sound & Alerts
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound">Notification Sounds</Label>
                    <p className="text-sm text-muted-foreground">Play sound when receiving notifications</p>
                  </div>
                  <Switch
                    id="sound"
                    checked={preferences?.soundEnabled ?? true}
                    onCheckedChange={(value) => handleToggle("soundEnabled", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-sound-enabled"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-4">Notification Types</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="content">Content Updates</Label>
                    <p className="text-sm text-muted-foreground">New daily sadhana content and guides</p>
                  </div>
                  <Switch
                    id="content"
                    checked={preferences?.contentUpdates ?? true}
                    onCheckedChange={(value) => handleToggle("contentUpdates", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-content-updates"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="announcements">Announcements</Label>
                    <p className="text-sm text-muted-foreground">Important updates and messages</p>
                  </div>
                  <Switch
                    id="announcements"
                    checked={preferences?.announcements ?? true}
                    onCheckedChange={(value) => handleToggle("announcements", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-announcements"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="media">Media Additions</Label>
                    <p className="text-sm text-muted-foreground">New audio and video content</p>
                  </div>
                  <Switch
                    id="media"
                    checked={preferences?.mediaAdditions ?? true}
                    onCheckedChange={(value) => handleToggle("mediaAdditions", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-media-additions"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="scripture">Scripture Updates</Label>
                    <p className="text-sm text-muted-foreground">New scriptures and religious texts</p>
                  </div>
                  <Switch
                    id="scripture"
                    checked={preferences?.scriptureUpdates ?? true}
                    onCheckedChange={(value) => handleToggle("scriptureUpdates", value)}
                    disabled={updatePreferencesMutation.isPending}
                    data-testid="switch-scripture-updates"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">App Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="offline">Offline Mode</Label>
              <p className="text-sm text-muted-foreground">Cache content for offline access</p>
            </div>
            <Switch
              id="offline"
              checked={offlineMode}
              onCheckedChange={setOfflineMode}
              data-testid="switch-offline"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">About</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Trisandhya Sadhana Companion v1.0</p>
          <p>Spiritual content sourced from Bhavishyamalika.com</p>
          <p className="pt-2 font-serif italic">May Lord Jagannath bless your spiritual journey</p>
        </div>
      </Card>
    </div>
  );
}
