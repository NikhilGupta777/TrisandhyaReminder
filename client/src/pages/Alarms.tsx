import { AlarmSettings } from "@/components/AlarmSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlarmInterface } from "@/components/AlarmInterface";
import { useState } from "react";
import bellImage from "@assets/stock_images/sacred_temple_bell_h_edbb7860.jpg";
import conchImage from "@assets/stock_images/conch_shell_shankh_h_85a28022.jpg";

export default function Alarms() {
  const [showAlarm, setShowAlarm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Alarm Configuration</h1>
        <p className="text-muted-foreground">Set up reminders for your daily Sandhya practices</p>
      </div>

      <AlarmSettings />

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
