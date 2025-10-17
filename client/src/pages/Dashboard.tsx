import { Card } from "@/components/ui/card";
import { LiveClock } from "@/components/LiveClock";
import { SandhyaCountdown } from "@/components/SandhyaCountdown";
import { SadhanaChecklist } from "@/components/SadhanaChecklist";
import { Button } from "@/components/ui/button";
import { BookOpen, Music, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import deityBg from "@assets/stock_images/sunrise_golden_hour__a22c9f34.jpg";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div
        className="relative h-64 rounded-lg overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${deityBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 space-y-3">
          <h1 className="text-4xl font-bold font-serif text-white drop-shadow-lg" data-testid="text-greeting">
            Jai Jagannath
          </h1>
          <p className="text-lg text-white/90">Welcome to your spiritual journey</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <LiveClock />
        </Card>
        <SandhyaCountdown />
      </div>

      <SadhanaChecklist />

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/guide">
          <Card className="p-6 text-center space-y-3 cursor-pointer hover-elevate active-elevate-2" data-testid="card-guide">
            <BookOpen className="h-12 w-12 mx-auto text-primary" />
            <h3 className="font-semibold">Daily Sadhna</h3>
            <p className="text-sm text-muted-foreground">Learn about Trisandhya practices</p>
          </Card>
        </Link>

        <Link href="/media">
          <Card className="p-6 text-center space-y-3 cursor-pointer hover-elevate active-elevate-2" data-testid="card-media">
            <Music className="h-12 w-12 mx-auto text-primary" />
            <h3 className="font-semibold">Media Library</h3>
            <p className="text-sm text-muted-foreground">Bhajans and Pravachan videos</p>
          </Card>
        </Link>

        <Link href="/progress">
          <Card className="p-6 text-center space-y-3 cursor-pointer hover-elevate active-elevate-2" data-testid="card-progress">
            <BarChart3 className="h-12 w-12 mx-auto text-primary" />
            <h3 className="font-semibold">Track Progress</h3>
            <p className="text-sm text-muted-foreground">View your spiritual journey</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
