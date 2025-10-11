import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { LiveClock } from "@/components/LiveClock";
import { SandhyaCountdown } from "@/components/SandhyaCountdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BookOpen, Music, BarChart3, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SadhanaProgress } from "@shared/schema";
import deityBg from "@assets/stock_images/sunrise_golden_hour__a22c9f34.jpg";

export default function DashboardConnected() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const { data: progress } = useQuery<SadhanaProgress>({
    queryKey: ["/api/sadhana-progress/today"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: Partial<SadhanaProgress>) => {
      return await apiRequest("POST", "/api/sadhana-progress", {
        ...progress,
        ...data,
        date: today,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sadhana-progress/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sadhana-progress/stats"] });
    },
  });

  const toggleItem = (field: string) => {
    updateProgressMutation.mutate({ [field]: !progress?.[field as keyof SadhanaProgress] });
  };

  const checklist = [
    { id: "pratahCompleted", label: "Pratah Sandhya", completed: progress?.pratahCompleted },
    { id: "madhyahnaCompleted", label: "Madhyahna Sandhya", completed: progress?.madhyahnaCompleted },
    { id: "sayamCompleted", label: "Sayam Sandhya", completed: progress?.sayamCompleted },
    { id: "mahapuranCompleted", label: "Shrimad Bhagwat Mahapuran", completed: progress?.mahapuranCompleted },
    { id: "japCompleted", label: "Madhav Naam Jap", completed: progress?.japCompleted },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;

  return (
    <div className="space-y-6">
      <div
        className="relative h-64 rounded-lg overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${deityBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 space-y-3">
          <h1 className="text-4xl font-bold font-serif text-white drop-shadow-lg" data-testid="text-greeting">
            Jai Jagannath, {user?.firstName || "Devotee"}
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

      <Card className="p-6 space-y-4" data-testid="sadhana-checklist">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Today's Sadhana</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{completedCount}/{checklist.length}</span>
          </div>
        </div>
        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-md hover-elevate active-elevate-2 cursor-pointer transition-colors"
              onClick={() => toggleItem(item.id)}
              data-testid={`checklist-item-${item.id}`}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className="h-5 w-5"
              />
              <label className={`flex-1 cursor-pointer ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/guide">
          <Card className="p-6 text-center space-y-3 cursor-pointer hover-elevate active-elevate-2" data-testid="card-guide">
            <BookOpen className="h-12 w-12 mx-auto text-primary" />
            <h3 className="font-semibold">Sadhana Guide</h3>
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
