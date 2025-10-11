import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlarmInterface } from "@/components/AlarmInterface";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AlarmSettings } from "@shared/schema";
import bellImage from "@assets/stock_images/sacred_temple_bell_h_edbb7860.jpg";
import conchImage from "@assets/stock_images/conch_shell_shankh_h_85a28022.jpg";

export default function AlarmsConnected() {
  const { toast } = useToast();
  const [showAlarm, setShowAlarm] = useState(false);
  
  const { data: settings } = useQuery<AlarmSettings>({
    queryKey: ["/api/alarm-settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<AlarmSettings>) => {
      return await apiRequest("POST", "/api/alarm-settings", { ...settings, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarm-settings"] });
      toast({ title: "Settings updated" });
    },
  });

  const toggleAlarm = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Alarm Configuration</h1>
        <p className="text-muted-foreground">Set up reminders for your daily Sandhya practices</p>
      </div>

      <Card className="p-6 space-y-6" data-testid="alarm-settings">
        <h3 className="text-lg font-semibold">Alarm Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pratah-alarm" className="text-base">Pratah Sandhya (3:35 AM - 6:30 AM)</Label>
            <Switch
              id="pratah-alarm"
              checked={settings?.pratahEnabled}
              onCheckedChange={(checked) => toggleAlarm("pratahEnabled", checked)}
              data-testid="switch-pratah-alarm"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="madhyahna-alarm" className="text-base">Madhyahna Sandhya (11:30 AM - 1:00 PM)</Label>
            <Switch
              id="madhyahna-alarm"
              checked={settings?.madhyahnaEnabled}
              onCheckedChange={(checked) => toggleAlarm("madhyahnaEnabled", checked)}
              data-testid="switch-madhyahna-alarm"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sayam-alarm" className="text-base">Sayam Sandhya (5:30 PM - 6:30 PM)</Label>
            <Switch
              id="sayam-alarm"
              checked={settings?.sayamEnabled}
              onCheckedChange={(checked) => toggleAlarm("sayamEnabled", checked)}
              data-testid="switch-sayam-alarm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alarm-sound">Alarm Sound</Label>
          <Select
            value={settings?.soundType}
            onValueChange={(value) => updateSettingsMutation.mutate({ soundType: value })}
          >
            <SelectTrigger id="alarm-sound" data-testid="select-alarm-sound">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bell">Temple Bell</SelectItem>
              <SelectItem value="conch">Conch Shell (Shankh)</SelectItem>
              <SelectItem value="madhav">Madhav Chant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alarm-volume">Volume</Label>
          <Slider
            id="alarm-volume"
            value={[settings?.volume || 80]}
            onValueChange={(value) => updateSettingsMutation.mutate({ volume: value[0] })}
            max={100}
            step={1}
            data-testid="slider-alarm-volume"
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Alarm Sounds Preview</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative h-32 rounded-md overflow-hidden">
            <img src={bellImage} alt="Temple Bell" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold">Temple Bell</span>
            </div>
          </div>
          <div className="relative h-32 rounded-md overflow-hidden">
            <img src={conchImage} alt="Conch Shell" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold">Conch Shell</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Test Alarm Interface</h3>
        <p className="text-sm text-muted-foreground">
          Preview how the alarm will appear when it's time for Sandhya
        </p>
        <Button onClick={() => setShowAlarm(true)} data-testid="button-test-alarm">
          Show Test Alarm
        </Button>
      </Card>

      <AlarmInterface
        open={showAlarm}
        onOpenChange={setShowAlarm}
        sandhyaName="Pratah Sandhya"
      />
    </div>
  );
}
