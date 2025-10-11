import { ProgressCalendar } from "@/components/ProgressCalendar";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function Progress() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Your Spiritual Progress</h1>
        <p className="text-muted-foreground">Track your Sadhana journey and maintain consistency</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Current Streak</p>
          <p className="text-4xl font-bold text-primary">7</p>
          <p className="text-xs text-muted-foreground">days</p>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Total Japa Count</p>
          <p className="text-4xl font-bold text-primary">1,458</p>
          <p className="text-xs text-muted-foreground">chants</p>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Longest Streak</p>
          <p className="text-4xl font-bold text-primary">21</p>
          <p className="text-xs text-muted-foreground">days</p>
        </Card>
      </div>

      <ProgressCalendar />

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Consistency Insights</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            You've maintained a 7-day streak! Keep going to reach your goal of 21 consecutive days.
          </p>
          <p className="text-muted-foreground">
            Your best practice time is during Pratah Sandhya. Consider setting alarms for other periods too.
          </p>
        </div>
      </Card>
    </div>
  );
}
