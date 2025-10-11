import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

type Stats = {
  currentStreak: number;
  longestStreak: number;
  totalJapCount: number;
  completedDays: number;
};

export default function ProgressConnected() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/sadhana-progress/stats"],
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Your Spiritual Progress</h1>
        <p className="text-muted-foreground">Track your Sadhana journey and maintain consistency</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Current Streak</p>
          <p className="text-4xl font-bold text-primary">{stats?.currentStreak || 0}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Total Japa Count</p>
          <p className="text-4xl font-bold text-primary">{stats?.totalJapCount || 0}</p>
          <p className="text-xs text-muted-foreground">chants</p>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Longest Streak</p>
          <p className="text-4xl font-bold text-primary">{stats?.longestStreak || 0}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4" data-testid="progress-calendar">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sadhana Progress</h3>
          <Badge variant="default" className="text-sm">
            🔥 {stats?.currentStreak || 0} Day Streak
          </Badge>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completed Days</span>
            <span className="font-semibold">{stats?.completedDays || 0}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Consistency Insights</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            {stats?.currentStreak ? `You've maintained a ${stats.currentStreak}-day streak! Keep going.` : "Start your journey today!"}
          </p>
          <p className="text-muted-foreground">
            Regular practice brings spiritual growth and inner peace.
          </p>
        </div>
      </Card>
    </div>
  );
}
