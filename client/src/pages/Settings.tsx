import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and profile</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Profile Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" defaultValue="Devotee" data-testid="input-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" data-testid="input-email" />
            </div>
            <Button data-testid="button-save-profile">Save Changes</Button>
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
