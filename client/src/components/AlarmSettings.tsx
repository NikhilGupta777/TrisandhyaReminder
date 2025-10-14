import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function AlarmSettings() {
  const [alarms, setAlarms] = useState({
    pratah: true,
    madhyahna: true,
    sayam: true,
  });
  const [sound, setSound] = useState("bell");
  const [volume, setVolume] = useState([80]);

  const toggleAlarm = (key: keyof typeof alarms) => {
    setAlarms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="p-6 space-y-6" data-testid="alarm-settings">
      <h3 className="text-lg font-semibold">Alarm Settings</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="pratah-alarm" className="text-base">Pratah Sandhya (3:35 AM - 6:30 AM)</Label>
          <Switch
            id="pratah-alarm"
            checked={alarms.pratah}
            onCheckedChange={() => toggleAlarm("pratah")}
            data-testid="switch-pratah-alarm"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="madhyahna-alarm" className="text-base">Madhyahna Sandhya (11:30 AM - 1:00 PM)</Label>
          <Switch
            id="madhyahna-alarm"
            checked={alarms.madhyahna}
            onCheckedChange={() => toggleAlarm("madhyahna")}
            data-testid="switch-madhyahna-alarm"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sayam-alarm" className="text-base">Sayam Sandhya (5:30 PM - 6:30 PM)</Label>
          <Switch
            id="sayam-alarm"
            checked={alarms.sayam}
            onCheckedChange={() => toggleAlarm("sayam")}
            data-testid="switch-sayam-alarm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alarm-sound">Alarm Sound</Label>
        <Select value={sound} onValueChange={setSound}>
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
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          data-testid="slider-alarm-volume"
        />
      </div>
    </Card>
  );
}
