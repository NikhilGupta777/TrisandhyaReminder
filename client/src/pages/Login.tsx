import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { SiGoogle } from "react-icons/si";
import { Sparkles, Mail, Lock, User, Loader2, KeyRound } from "lucide-react";
import deityBg from "@assets/stock_images/sunrise_golden_hour__a22c9f34.jpg";
import { queryClient } from "@/lib/queryClient";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showVerification, setShowVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Check for Google sign-in errors in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error === 'google_signin_failed') {
      toast({
        title: "Google Sign-in Failed",
        description: "Please verify your email through the registration process first, or use email/password login.",
        variant: "destructive",
        duration: 8000,
      });
      // Clean up URL
      window.history.replaceState({}, '', '/login');
    }
  }, [toast]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [verificationData, setVerificationData] = useState({
    email: "",
    code: "",
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    email: "",
    code: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Logged in successfully",
        });
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        window.location.href = "/";
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationData({
          email: registerData.email,
          code: "",
        });
        setShowVerification(true);
        toast({
          title: "Registration Successful!",
          description: "Please check your email for the verification code.",
          duration: 10000,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to register",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationData.email,
          code: verificationData.code,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email Verified!",
          description: "You can now log in with your credentials.",
        });
        setShowVerification(false);
        setRegisterData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
        });
        setVerificationData({ email: "", code: "" });
        setActiveTab("login");
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotPasswordData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setResetPasswordData({
          email: forgotPasswordData.email,
          code: "",
          password: "",
        });
        setShowForgotPassword(false);
        setShowResetPassword(true);
        toast({
          title: "Reset Code Sent",
          description: "Please check your email for the password reset code.",
          duration: 10000,
        });
      } else {
        toast({
          title: "Request Failed",
          description: data.message || "Email not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetPasswordData.email,
          code: resetPasswordData.code,
          password: resetPasswordData.password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset Successful!",
          description: "You can now log in with your new password.",
        });
        setShowResetPassword(false);
        setForgotPasswordData({ email: "" });
        setResetPasswordData({ email: "", code: "", password: "" });
        setActiveTab("login");
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Invalid reset code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during password reset",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationData.email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email Sent!",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        toast({
          title: "Failed to Resend",
          description: data.message || "Could not resend verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while resending the email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      data-testid="input-login-email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      data-testid="input-login-password"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-orange-600 dark:text-orange-400 px-0 h-auto"
                    onClick={() => setShowForgotPassword(true)}
                    data-testid="button-forgot-password"
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-950 px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-2"
                onClick={() => window.location.href = "/api/auth/google"}
                data-testid="button-google-login"
              >
                <SiGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstname">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-firstname"
                        type="text"
                        placeholder="First"
                        className="pl-10"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        required
                        data-testid="input-register-firstname"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-lastname">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-lastname"
                        type="text"
                        placeholder="Last"
                        className="pl-10"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        required
                        data-testid="input-register-lastname"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      data-testid="input-register-email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      minLength={6}
                      data-testid="input-register-password"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 6 characters
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Code Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent 
          className="sm:max-w-md" 
          data-testid="dialog-verification"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Verify Your Email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a 6-digit verification code to your email. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyCode}>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check your email inbox for the verification code.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="000000"
                    className="pl-10 text-center text-lg tracking-wider"
                    maxLength={6}
                    value={verificationData.code}
                    onChange={(e) => setVerificationData({ ...verificationData, code: e.target.value.replace(/\D/g, '') })}
                    required
                    data-testid="input-verification-code"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Didn't receive the email?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  data-testid="button-resend-verification"
                >
                  Resend Verification Email
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                disabled={isLoading || verificationData.code.length !== 6}
                data-testid="button-verify-code"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-forgot-password">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Forgot Password</DialogTitle>
            <DialogDescription className="text-center">
              Enter your email to receive a password reset code
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={forgotPasswordData.email}
                    onChange={(e) => setForgotPasswordData({ email: e.target.value })}
                    required
                    data-testid="input-forgot-email"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                disabled={isLoading}
                data-testid="button-request-reset"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-reset-password">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Reset Password</DialogTitle>
            <DialogDescription className="text-center">
              Enter the reset code from your email and your new password
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check your email for the password reset code.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-code">Reset Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-code"
                    type="text"
                    placeholder="000000"
                    className="pl-10 text-center text-lg tracking-wider"
                    maxLength={6}
                    value={resetPasswordData.code}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, code: e.target.value.replace(/\D/g, '') })}
                    required
                    data-testid="input-reset-code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    minLength={6}
                    value={resetPasswordData.password}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                    required
                    data-testid="input-new-password"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 6 characters
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                disabled={isLoading || resetPasswordData.code.length !== 6}
                data-testid="button-reset-password"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
