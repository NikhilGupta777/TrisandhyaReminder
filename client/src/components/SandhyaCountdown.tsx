import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type SandhyaPeriod = {
  name: string;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

const SANDHYA_PERIODS: SandhyaPeriod[] = [
  { name: "pratah", label: "Pratah Sandhya (Brahma Muhurta)", startHour: 3, startMinute: 35, endHour: 6, endMinute: 30 },
  { name: "madhyahna", label: "Madhyahna Sandhya (Abhijit Muhurta)", startHour: 11, startMinute: 30, endHour: 13, endMinute: 0 },
  { name: "sayam", label: "Sayam Sandhya (Godhuli Bela)", startHour: 17, startMinute: 30, endHour: 18, endMinute: 30 },
];

function getNextSandhya() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const period of SANDHYA_PERIODS) {
    const startMinutes = period.startHour * 60 + period.startMinute;
    if (currentMinutes < startMinutes) {
      const target = new Date(now);
      target.setHours(period.startHour, period.startMinute, 0, 0);
      return { period, target };
    }
  }

  const nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(SANDHYA_PERIODS[0].startHour, SANDHYA_PERIODS[0].startMinute, 0, 0);
  return { period: SANDHYA_PERIODS[0], target: nextDay };
}

export function SandhyaCountdown() {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, label: "" });

  useEffect(() => {
    const updateCountdown = () => {
      const { period, target } = getNextSandhya();
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds, label: period.label });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-6 text-center space-y-4" data-testid="sandhya-countdown">
      <h3 className="text-lg font-medium text-muted-foreground">Next Sandhya</h3>
      <div className="relative">
        <div className="inline-flex items-center justify-center w-48 h-48 rounded-full border-8 border-primary/20 bg-primary/5">
          <div className="text-center">
            <div className="text-4xl font-bold tabular-nums text-primary">
              {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium font-serif text-foreground">{countdown.label}</p>
    </Card>
  );
}
