import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function SettingsConnected() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and profile</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Profile Information</h3>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "User"}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">App Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive reminders for Sandhya times</p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
              data-testid="switch-notifications"
            />
          </div>

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
