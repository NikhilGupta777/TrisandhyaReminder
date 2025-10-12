import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";
import { Sparkles, Bell, BookOpen, BarChart3 } from "lucide-react";
import deityBg from "@assets/stock_images/sunrise_golden_hour__a22c9f34.jpg";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${deityBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-amber-900/70 to-yellow-800/80 dark:from-black/80 dark:via-orange-950/80 dark:to-black/80" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-orange-200/20 dark:border-orange-800/30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 flex items-center justify-center shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold font-serif bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
            Trisandhya Sadhana
          </CardTitle>
          
          <CardDescription className="text-base text-gray-600 dark:text-gray-400">
            Your digital companion for daily spiritual practice
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Button
            size="lg"
            className="w-full py-6 text-lg font-medium bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => window.location.href = "/api/auth/google"}
            data-testid="button-google-login"
          >
            <SiGoogle className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Smart Alarms</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sacred Guide</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Track Progress</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Secure authentication powered by Google
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
