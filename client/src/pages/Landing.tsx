import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Bell,
  BarChart3,
  Users,
  Clock,
  Music,
  Sparkles,
  Shield,
  LogIn,
  Heart,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";
import deityBg from "@assets/stock_images/sunrise_golden_hour__a22c9f34.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <div
        className="relative min-h-screen bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${deityBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white"></h2>
            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 gap-2"
              onClick={() => (window.location.href = "/login")}
              data-testid="button-login-nav"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </div>
        </div>

        <div className="relative w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/30 backdrop-blur-md rounded-full border border-primary/40 shadow-lg hover:bg-primary/40 transition-all duration-300">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-white">
              Sacred Path to Satya Yuga
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-white drop-shadow-2xl max-w-5xl leading-tight animate-in slide-in-from-bottom duration-1000">
            Trisandhya Sadhana App
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl px-4 leading-relaxed animate-in slide-in-from-bottom duration-1000 delay-150">
            Your complete digital guide for the sacred Trikal Sandhya practice.
            Experience intelligent prayer reminders, track your spiritual
            progress, and access authentic content from Bhavishya Malika.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-in slide-in-from-bottom duration-1000 delay-300">
            <Button
              size="lg"
              className="px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 gap-2 group"
              onClick={() => (window.location.href = "/login")}
              data-testid="button-login"
            >
              Begin Your Journey
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 max-w-2xl animate-in slide-in-from-bottom duration-1000 delay-500">
            <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-2">
                3x
              </div>
              <div className="text-xs sm:text-sm text-white/80 mt-1">Daily Prayers</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-2">
                10min
              </div>
              <div className="text-xs sm:text-sm text-white/80 mt-1">Each Session</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-3xl sm:text-4xl font-bold text-white">∞</div>
              <div className="text-xs sm:text-sm text-white/80 mt-1">Spiritual Growth</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 sm:py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">
              What is Trisandhya?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Trisandhya, the sacred practice of offering prayers to Lord
              Mahavishnu three times daily—at dawn, noon, and sunset—is
              mentioned in the 600-year-old Bhavishya Malika scripture as the
              path to salvation during Kaliyuga's end times.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 text-center space-y-4 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mx-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Smart Alarms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Precise timing reminders for Pratah (3:45-6:30 AM),
                Madhyahna (11:30 AM-1 PM), and Sayam Sandhya (5-6:30 PM)
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mx-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Complete Mantras</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Authentic Vishnu Shodasha Naam, Dashavatara Stotram, Durga
                Madhav Stuti, and Kalki Mahamantra with meanings
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mx-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visual calendar, streak counter, and daily Japa tracking to
                maintain consistency in your spiritual practice
              </p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-primary/20 hover:border-primary/40 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mx-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Music className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Media Library</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access bhajans, pravachans, and sacred audio content to deepen
                your spiritual understanding
              </p>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-12 sm:py-20 px-4 sm:px-6 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-center mb-12 sm:mb-16">
            Spiritual Benefits
          </h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4 items-start">
              <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Protection & Safety</h3>
                <p className="text-sm text-muted-foreground">
                  Shield from upcoming calamities and the 64 types of viruses
                  predicted for the future
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Mental Peace</h3>
                <p className="text-sm text-muted-foreground">
                  Reduces stress, eliminates depression, improves concentration
                  and boosts self-confidence
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Seven Generations</h3>
                <p className="text-sm text-muted-foreground">
                  Liberates seven generations of your lineage and ensures
                  opportunity to witness Lord Kalki
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Health Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Lower blood pressure, better sleep quality, and improved
                  overall physical well-being
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Spiritual Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Daily practice fosters self-realization and understanding of
                  life's true purpose
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Family Harmony</h3>
                <p className="text-sm text-muted-foreground">
                  Enhances family bonding and encourages positive social
                  participation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 sm:py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif">
            Start Your Sacred Journey Today
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Join thousands of devotees practicing the sacred Trisandhya path.
            Begin with just 10 minutes, three times a day, and experience
            profound transformation.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = "/login")}
            className="px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg shadow-xl hover:scale-105 transition-transform"
            data-testid="button-login-bottom"
          >
            Sign In to Continue
          </Button>
          <p className="text-sm text-muted-foreground pt-4">
            Free to use • No credit card required • Original Trisandhya content
            from Bhavishya Malika
          </p>
        </div>
      </div>
    </div>
  );
}
