import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";
import { format, subDays } from "date-fns";
import type { JapaSettings } from "@shared/schema";

type Stats = {
  currentStreak: number;
  longestStreak: number;
  totalJapCount: number;
  completedDays: number;
};

type SadhanaProgress = {
  id: string;
  userId: string;
  date: string;
  japCount: number;
  japCompleted: boolean;
};

export default function ProgressConnected() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/sadhana-progress/stats"],
  });

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = subDays(new Date(), 29).toISOString().split('T')[0];

  const { data: progressHistory = [] } = useQuery<SadhanaProgress[]>({
    queryKey: ["/api/sadhana-progress/range", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/sadhana-progress/range?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: settings } = useQuery<JapaSettings>({
    queryKey: ["/api/japa-settings"],
  });

  const dailyGoal = settings?.dailyGoal || 108;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = date.toISOString().split('T')[0];
    const progress = progressHistory.find(p => p.date === dateStr);
    return {
      date: dateStr,
      day: format(date, 'EEE'),
      count: progress?.japCount || 0,
      goalReached: (progress?.japCount || 0) >= dailyGoal,
    };
  });

  const maxCount = Math.max(...last7Days.map(d => d.count), dailyGoal);

  return (
    <div className="space-y-6 pb-8">
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

      <Card className="p-6 space-y-6" data-testid="japa-history-chart">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Last 7 Days Japa Progress</h3>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Goal: {dailyGoal}
          </Badge>
        </div>

        <div className="space-y-4">
          {last7Days.map((day) => (
            <div key={day.date} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium min-w-[3rem]">{day.day}</span>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(day.date), 'MMM d')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{day.count}</span>
                  {day.goalReached && (
                    <Award className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                    day.goalReached ? 'bg-primary' : 'bg-primary/50'
                  }`}
                  style={{ width: `${Math.min((day.count / maxCount) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {last7Days.filter(d => d.goalReached).length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-primary" />
              <span>
                {last7Days.filter(d => d.goalReached).length} out of 7 days goal achieved
              </span>
            </div>
          </div>
        )}
      </Card>

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
