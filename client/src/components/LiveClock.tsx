import { useEffect, useState } from "react";
import { format } from "date-fns";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center space-y-1" data-testid="live-clock">
      <div className="text-4xl font-semibold tabular-nums tracking-tight">
        {format(time, "hh:mm:ss a")}
      </div>
      <div className="text-sm text-muted-foreground">
        {format(time, "EEEE, MMMM d, yyyy")}
      </div>
    </div>
  );
}
