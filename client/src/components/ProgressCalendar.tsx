import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProgressCalendar() {
  const daysInMonth = 30;
  const completedDays = [1, 2, 3, 5, 7, 8, 10, 12, 14, 15, 16, 18, 20, 22];
  const currentDay = 23;

  const getCurrentStreak = () => {
    let streak = 0;
    for (let i = currentDay - 1; i >= 1; i--) {
      if (completedDays.includes(i)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <Card className="p-6 space-y-4" data-testid="progress-calendar">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sadhana Progress</h3>
        <Badge variant="default" className="text-sm">
          🔥 {getCurrentStreak()} Day Streak
        </Badge>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const isCompleted = completedDays.includes(day);
          const isCurrent = day === currentDay;

          return (
            <div
              key={day}
              className={`
                aspect-square rounded-md flex items-center justify-center text-sm font-medium
                ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}
                ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
              `}
              data-testid={`calendar-day-${day}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completed Days</span>
          <span className="font-semibold">{completedDays.length}/{daysInMonth}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Consistency Rate</span>
          <span className="font-semibold">{Math.round((completedDays.length / daysInMonth) * 100)}%</span>
        </div>
      </div>
    </Card>
  );
}
