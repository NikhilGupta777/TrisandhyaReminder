import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">404 Page Not Found</h1>
          </div>
          
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => setLocation("/")} 
              className="w-full"
              size="lg"
              data-testid="button-go-home"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="w-full"
              size="lg"
              data-testid="button-go-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
