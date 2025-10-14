import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./googleAuth";
import passport from "passport";
import { sendVerificationEmail, sendVerificationCodeEmail, sendPasswordResetEmail, sendWelcomeEmail } from "./sendgrid";
import {
  insertAlarmSettingsSchema,
  insertSadhanaProgressSchema,
  insertMediaContentSchema,
  insertScriptureContentSchema,
  registerUserSchema,
  loginUserSchema,
  verifyCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Registration endpoint
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      passport.authenticate("local-signup", async (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Registration failed" });
        }
        
        if (!user) {
          return res.status(400).json({ message: info?.message || "Registration failed" });
        }

        // Send verification email with code and link
        try {
          await sendVerificationCodeEmail(
            user.email,
            user.firstName,
            user.verificationCode,
            user.verificationToken
          );
          
          res.status(201).json({ 
            message: "Registration successful! Please check your email for the verification code.",
            email: user.email,
            requiresVerification: true
          });
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          
          // Delete the user if email sending fails
          try {
            await storage.deleteUser(user.id);
          } catch (deleteError) {
            console.error('Failed to delete user after email error:', deleteError);
          }
          
          return res.status(500).json({ 
            message: "Failed to send verification email. Please check your email configuration and try again." 
          });
        }
      })(req, res, next);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid registration data" });
    }
  });

  // Verify email with code endpoint
  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const validatedData = verifyCodeSchema.parse(req.body);
      const user = await storage.verifyUserCode(validatedData.email, validatedData.code);
      
      if (!user) {
        return res.status(400).json({ 
          message: "Invalid or expired verification code" 
        });
      }

      res.json({ 
        message: "Email verified successfully! You can now log in.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid verification data" });
    }
  });

  // Resend verification email endpoint
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate new code and token
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationCodeExpiry = new Date();
      verificationCodeExpiry.setMinutes(verificationCodeExpiry.getMinutes() + 15);

      // Update user with new codes
      await storage.updateVerificationCode(email, verificationCode, verificationToken, verificationCodeExpiry);

      // Send verification email
      try {
        await sendVerificationCodeEmail(
          email, // Use the email from request since it's guaranteed to be string
          (user.firstName as string) || 'User',
          verificationCode,
          verificationToken
        );
      } catch (emailError) {
        console.error('Failed to resend verification email:', emailError);
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      res.json({ 
        message: "Verification email resent successfully. Please check your inbox.",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Forgot password - request reset code
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const user = await storage.setResetPasswordCode(validatedData.email, resetCode);
      
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      // Send password reset email
      try {
        await sendPasswordResetEmail(
          validatedData.email, // Use the validated email from request
          (user.firstName as string) || 'User',
          resetCode
        );
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      res.json({ 
        message: "Password reset code has been sent to your email.",
        email: validatedData.email
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Reset password with code
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.resetPasswordWithCode(
        validatedData.email,
        validatedData.code,
        hashedPassword
      );
      
      if (!user) {
        return res.status(400).json({ 
          message: "Invalid or expired reset code" 
        });
      }

      res.json({ 
        message: "Password reset successful! You can now log in with your new password."
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid reset data" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      passport.authenticate("local-login", (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            return res.status(500).json({ message: "Login failed" });
          }
          
          res.json({ 
            message: "Login successful",
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              isAdmin: user.isAdmin,
            }
          });
        });
      })(req, res, next);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid login data" });
    }
  });

  // Email verification endpoint
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      
      if (!token) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invalid Verification Link</h1>
            <p>This verification link is invalid.</p>
          </body>
          </html>
        `);
      }

      const user = await storage.verifyUserEmail(token);
      
      if (!user) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Verification Failed</h1>
            <p>This verification link is invalid or has expired.</p>
            <a href="/login" style="color: #f97316;">Go to Login</a>
          </body>
          </html>
        `);
      }

      await sendWelcomeEmail(user.email!, user.firstName!);

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
            h1 { color: #f97316; }
            .button { display: inline-block; background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Email Verified!</h1>
            <p>Your email has been successfully verified.</p>
            <p>You can now log in to your account.</p>
            <a href="/login" class="button">Go to Login</a>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>❌ Verification Error</h1>
          <p>An error occurred during verification. Please try again later.</p>
        </body>
        </html>
      `);
    }
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Alarm settings routes
  app.get("/api/alarm-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let settings = await storage.getAlarmSettings(userId);
      
      if (!settings) {
        settings = await storage.upsertAlarmSettings({
          userId,
          pratahEnabled: true,
          madhyahnaEnabled: true,
          sayamEnabled: true,
          soundType: "bell",
          volume: 80,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching alarm settings:", error);
      res.status(500).json({ message: "Failed to fetch alarm settings" });
    }
  });

  app.post("/api/alarm-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertAlarmSettingsSchema.parse({
        ...req.body,
        userId,
      });
      
      const settings = await storage.upsertAlarmSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating alarm settings:", error);
      res.status(400).json({ message: "Invalid alarm settings data" });
    }
  });

  // Sadhana progress routes
  app.get("/api/sadhana-progress/today", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split("T")[0];
      
      let progress = await storage.getSadhanaProgress(userId, today);
      
      if (!progress) {
        progress = await storage.upsertSadhanaProgress({
          userId,
          date: today,
          pratahCompleted: false,
          madhyahnaCompleted: false,
          sayamCompleted: false,
          mahapuranCompleted: false,
          japCompleted: false,
          japCount: 0,
        });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching sadhana progress:", error);
      res.status(500).json({ message: "Failed to fetch sadhana progress" });
    }
  });

  app.post("/api/sadhana-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertSadhanaProgressSchema.parse({
        ...req.body,
        userId,
      });
      
      const progress = await storage.upsertSadhanaProgress(validatedData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating sadhana progress:", error);
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  app.get("/api/sadhana-progress/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/sadhana-progress/range", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      const progress = await storage.getSadhanaProgressByDateRange(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress range:", error);
      res.status(500).json({ message: "Failed to fetch progress range" });
    }
  });

  // Media content routes
  app.get("/api/media", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const media = await storage.getAllMedia(type);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const media = await storage.getMediaById(parseInt(req.params.id));
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Scripture content routes
  app.get("/api/scriptures", async (req, res) => {
    try {
      const scriptures = await storage.getAllScriptures();
      res.json(scriptures);
    } catch (error) {
      console.error("Error fetching scriptures:", error);
      res.status(500).json({ message: "Failed to fetch scriptures" });
    }
  });

  app.get("/api/scriptures/:chapter", async (req, res) => {
    try {
      const chapterNumber = parseInt(req.params.chapter);
      const scripture = await storage.getScriptureByChapter(chapterNumber);
      
      if (!scripture) {
        return res.status(404).json({ message: "Scripture not found" });
      }
      
      res.json(scripture);
    } catch (error) {
      console.error("Error fetching scripture:", error);
      res.status(500).json({ message: "Failed to fetch scripture" });
    }
  });

  // Admin routes - User management
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/admin", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { isAdmin: adminStatus } = req.body;
      const user = await storage.updateUserAdminStatus(parseInt(req.params.id), adminStatus);
      res.json(user);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(parseInt(req.params.id));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin routes - Media management
  app.post("/api/admin/media", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertMediaContentSchema.parse(req.body);
      const media = await storage.createMedia(validatedData);
      res.json(media);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });

  app.patch("/api/admin/media/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const media = await storage.updateMedia(parseInt(req.params.id), req.body);
      res.json(media);
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  app.delete("/api/admin/media/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteMedia(parseInt(req.params.id));
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Admin routes - Scripture management
  app.post("/api/admin/scriptures", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertScriptureContentSchema.parse(req.body);
      const scripture = await storage.createScripture(validatedData);
      res.json(scripture);
    } catch (error) {
      console.error("Error creating scripture:", error);
      res.status(400).json({ message: "Invalid scripture data" });
    }
  });

  app.patch("/api/admin/scriptures/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const scripture = await storage.updateScripture(parseInt(req.params.id), req.body);
      res.json(scripture);
    } catch (error) {
      console.error("Error updating scripture:", error);
      res.status(500).json({ message: "Failed to update scripture" });
    }
  });

  app.delete("/api/admin/scriptures/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteScripture(parseInt(req.params.id));
      res.json({ message: "Scripture deleted successfully" });
    } catch (error) {
      console.error("Error deleting scripture:", error);
      res.status(500).json({ message: "Failed to delete scripture" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
