import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Bell, BarChart3, Users } from "lucide-react";
import deityBg from "@assets/stock_images/sunrise_golden_hour__a22c9f34.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <div
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${deityBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 space-y-8">
          <h1 className="text-6xl font-bold font-serif text-white drop-shadow-2xl">
            Trisandhya Sadhana Companion
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Your digital guide for daily spiritual practice with intelligent alarms, 
            progress tracking, and sacred content from Bhavishyamalika.com
          </p>
          <div className="flex gap-4 pt-6">
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg rounded-full"
              onClick={() => window.location.href = "/login"}
              data-testid="button-login"
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold font-serif text-center mb-12">Sacred Features</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 text-center space-y-4">
              <Bell className="h-12 w-12 mx-auto text-primary" />
              <h3 className="font-semibold text-lg">Intelligent Alarms</h3>
              <p className="text-sm text-muted-foreground">
                Three daily reminders for Pratah, Madhyahna, and Sayam Sandhya
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-primary" />
              <h3 className="font-semibold text-lg">Sadhana Guide</h3>
              <p className="text-sm text-muted-foreground">
                Complete spiritual guidance and Mahapuran Path tracker
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4">
              <BarChart3 className="h-12 w-12 mx-auto text-primary" />
              <h3 className="font-semibold text-lg">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Visual calendar and streaks to maintain consistency
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <h3 className="font-semibold text-lg">Community</h3>
              <p className="text-sm text-muted-foreground">
                Join fellow devotees on the spiritual path
              </p>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold font-serif">Ready to Begin?</h2>
          <p className="text-lg text-muted-foreground">
            Sign in with your Google account to start your spiritual journey
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/login"}
            className="px-12 py-6 text-lg"
            data-testid="button-login-bottom"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
