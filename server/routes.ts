import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./googleAuth";
import { authRateLimiter, apiRateLimiter, fileUploadRateLimiter } from "./middleware/rateLimiter";
import { logger } from "./middleware/logger";
import passport from "passport";
import {
  sendVerificationEmail,
  sendVerificationCodeEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./sendgrid";
import { uploadToS3, deleteFromS3 } from "./s3-upload";
import {
  insertAlarmSettingsSchema,
  insertSadhanaProgressSchema,
  insertMediaContentSchema,
  insertScriptureContentSchema,
  insertJapaAudioSchema,
  insertJapaSettingsSchema,
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
  app.post("/api/auth/register", authRateLimiter.middleware(), async (req, res, next) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);

      // Rate limiting check: 3 attempts per 15 minutes per email
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const recentAttempts = await storage.getRecentRegistrationAttempts(
        validatedData.email,
        fifteenMinutesAgo,
      );

      if (recentAttempts.length >= 3) {
        return res.status(429).json({
          message:
            "Too many registration attempts. Please try again in 15 minutes.",
        });
      }

      // Record this attempt
      const ipAddress = req.ip || req.socket.remoteAddress;
      await storage.recordRegistrationAttempt(validatedData.email, ipAddress);

      // Clean up old attempts (older than 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      storage
        .cleanupOldAttempts(oneDayAgo)
        .catch((err) => console.error("Failed to cleanup old attempts:", err));

      passport.authenticate(
        "local-signup",
        async (err: any, user: any, info: any) => {
          if (err) {
            return res.status(500).json({ message: "Registration failed" });
          }

          if (!user) {
            return res
              .status(400)
              .json({ message: info?.message || "Registration failed" });
          }

          // Send verification email with code and link
          try {
            await sendVerificationCodeEmail(
              user.email,
              user.firstName,
              user.verificationCode,
              user.verificationToken,
            );

            res.status(201).json({
              message:
                "Registration successful! Please check your email for the verification code.",
              email: user.email,
              requiresVerification: true,
            });
          } catch (emailError) {
            console.error("Failed to send verification email:", emailError);

            // Delete the user if email sending fails
            try {
              await storage.deleteUser(user.id);
            } catch (deleteError) {
              console.error(
                "Failed to delete user after email error:",
                deleteError,
              );
            }

            return res.status(500).json({
              message:
                "Failed to send verification email. Please check your email configuration and try again.",
            });
          }
        },
      )(req, res, next);
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Invalid registration data" });
    }
  });

  // Verify email with code endpoint
  app.post("/api/auth/verify-code", authRateLimiter.middleware(), async (req, res) => {
    try {
      const validatedData = verifyCodeSchema.parse(req.body);
      const user = await storage.verifyUserCode(
        validatedData.email,
        validatedData.code,
      );

      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired verification code",
        });
      }

      res.json({
        message: "Email verified successfully! You can now log in.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Invalid verification data" });
    }
  });

  // Resend verification email endpoint
  app.post("/api/auth/resend-verification", authRateLimiter.middleware(), async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Rate limiting check: 3 attempts per 15 minutes per email
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const recentAttempts = await storage.getRecentRegistrationAttempts(
        email,
        fifteenMinutesAgo,
      );

      if (recentAttempts.length >= 3) {
        return res.status(429).json({
          message:
            "Too many verification requests. Please try again in 15 minutes.",
        });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Record this attempt
      const ipAddress = req.ip || req.socket.remoteAddress;
      await storage.recordRegistrationAttempt(email, ipAddress);

      // Generate new code and token
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationCodeExpiry = new Date();
      verificationCodeExpiry.setMinutes(
        verificationCodeExpiry.getMinutes() + 15,
      );

      // Update user with new codes
      await storage.updateVerificationCode(
        email,
        verificationCode,
        verificationToken,
        verificationCodeExpiry,
      );

      // Send verification email
      try {
        await sendVerificationCodeEmail(
          email, // Use the email from request since it's guaranteed to be string
          (user.firstName as string) || "User",
          verificationCode,
          verificationToken,
        );
      } catch (emailError) {
        console.error("Failed to resend verification email:", emailError);
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      res.json({
        message:
          "Verification email resent successfully. Please check your inbox.",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Forgot password - request reset code
  app.post("/api/auth/forgot-password", authRateLimiter.middleware(), async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);

      // Rate limiting check: 3 attempts per 15 minutes per email
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const recentAttempts = await storage.getRecentRegistrationAttempts(
        validatedData.email,
        fifteenMinutesAgo,
      );

      if (recentAttempts.length >= 3) {
        return res.status(429).json({
          message:
            "Too many password reset requests. Please try again in 15 minutes.",
        });
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      const user = await storage.setResetPasswordCode(
        validatedData.email,
        resetCode,
      );

      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      // Record this attempt
      const ipAddress = req.ip || req.socket.remoteAddress;
      await storage.recordRegistrationAttempt(validatedData.email, ipAddress);

      // Send password reset email
      try {
        await sendPasswordResetEmail(
          validatedData.email, // Use the validated email from request
          (user.firstName as string) || "User",
          resetCode,
        );
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      res.json({
        message: "Password reset code has been sent to your email.",
        email: validatedData.email,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Reset password with code
  app.post("/api/auth/reset-password", authRateLimiter.middleware(), async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await storage.resetPasswordWithCode(
        validatedData.email,
        validatedData.code,
        hashedPassword,
      );

      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired reset code",
        });
      }

      res.json({
        message:
          "Password reset successful! You can now log in with your new password.",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid reset data" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", authRateLimiter.middleware(), async (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);

      passport.authenticate("local-login", (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Invalid credentials" });
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
            },
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
      logger.error("Error verifying email", error, {
        ip: req.ip,
      });
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
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      logger.error("Error fetching user", error, {
        userId: (req.user as any)?.id,
        ip: req.ip,
      });
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Alarm settings routes
  app.get("/api/alarm-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      let settings = await storage.getAlarmSettings(userId);

      if (!settings) {
        settings = await storage.upsertAlarmSettings({
          userId,
          pratahEnabled: true,
          madhyahnaEnabled: true,
          sayamEnabled: true,
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
      const userId = (req.user as any).id;
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
  app.get(
    "/api/sadhana-progress/today",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any).id;
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
    },
  );

  app.post("/api/sadhana-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
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

  app.get(
    "/api/sadhana-progress/stats",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any).id;
        const stats = await storage.getUserStats(userId);
        res.json(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Failed to fetch user stats" });
      }
    },
  );

  app.get(
    "/api/sadhana-progress/range",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = (req.user as any).id;
        const { startDate, endDate } = req.query;

        const progress = await storage.getSadhanaProgressByDateRange(
          userId,
          startDate as string,
          endDate as string,
        );
        res.json(progress);
      } catch (error) {
        console.error("Error fetching progress range:", error);
        res.status(500).json({ message: "Failed to fetch progress range" });
      }
    },
  );

  // Media content routes
  // Media category routes
  app.get("/api/media-categories", async (req, res) => {
    try {
      const categories = await storage.getAllMediaCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching media categories:", error);
      res.status(500).json({ message: "Failed to fetch media categories" });
    }
  });

  app.get("/api/media", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const media = await storage.getAllMedia(categoryId);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const media = await storage.getMediaById(req.params.id);
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
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch(
    "/api/admin/users/:id/admin",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const { isAdmin: adminStatus } = req.body;
        const user = await storage.updateUserAdminStatus(
          req.params.id,
          adminStatus,
        );
        res.json(user);
      } catch (error) {
        console.error("Error updating user admin status:", error);
        res.status(500).json({ message: "Failed to update user" });
      }
    },
  );

  app.delete(
    "/api/admin/users/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        await storage.deleteUser(req.params.id);
        res.json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
      }
    },
  );

  // Admin routes - Media management
  app.post("/api/admin/media", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertMediaContentSchema.parse(req.body);
      const media = await storage.createMedia(validatedData);
      res.json(media);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });

  app.patch(
    "/api/admin/media/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const media = await storage.updateMedia(req.params.id, req.body);
        res.json(media);
      } catch (error) {
        console.error("Error updating media:", error);
        res.status(500).json({ message: "Failed to update media" });
      }
    },
  );

  app.delete(
    "/api/admin/media/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const media = await storage.getMediaById(req.params.id);
        if (media && media.type === "audio") {
          const { extractS3Key, deleteFromS3 } = await import("./s3-upload");
          const key = extractS3Key(media.url);
          if (key) {
            await deleteFromS3(key);
          }
        }
        await storage.deleteMedia(req.params.id);
        res.json({ message: "Media deleted successfully" });
      } catch (error) {
        console.error("Error deleting media:", error);
        res.status(500).json({ message: "Failed to delete media" });
      }
    },
  );

  // Admin routes - Media category management
  app.post(
    "/api/admin/media-categories",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const { insertMediaCategorySchema } = await import("@shared/schema");
        const validatedData = insertMediaCategorySchema.parse(req.body);
        const category = await storage.createMediaCategory(validatedData);
        res.json(category);
      } catch (error) {
        console.error("Error creating media category:", error);
        res.status(400).json({ message: "Invalid category data" });
      }
    },
  );

  app.patch(
    "/api/admin/media-categories/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const category = await storage.updateMediaCategory(
          req.params.id,
          req.body,
        );
        res.json(category);
      } catch (error) {
        console.error("Error updating media category:", error);
        res.status(500).json({ message: "Failed to update category" });
      }
    },
  );

  app.delete(
    "/api/admin/media-categories/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        await storage.deleteMediaCategory(req.params.id);
        res.json({ message: "Category deleted successfully" });
      } catch (error) {
        console.error("Error deleting media category:", error);
        res.status(500).json({ message: "Failed to delete category" });
      }
    },
  );

  // Admin routes - File upload for media
  app.post(
    "/api/admin/media/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req: any, res) => {
      try {
        const multer = await import("multer");
        const multerS3 = (await import("multer-s3")).default;
        const { S3Client } = await import("@aws-sdk/client-s3");
        const path = await import("path");

        const s3Client = new S3Client({
          region: process.env.AWS_REGION!,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const bucketName = process.env.AWS_S3_BUCKET_NAME!;

        const audioMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac",
        ];

        const upload = multer.default({
          storage: multerS3({
            s3: s3Client,
            bucket: bucketName,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: (req: any, file: any, cb: any) => {
              cb(null, { fieldName: file.fieldname });
            },
            key: (req: any, file: any, cb: any) => {
              const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
              const ext = path.default.extname(file.originalname);
              const basename = path.default.basename(file.originalname, ext);
              cb(null, `media/${basename}-${uniqueSuffix}${ext}`);
            },
          }) as any,
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: (req: any, file: any, cb: any) => {
            if (audioMimeTypes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(
                new Error(
                  `Invalid file type for media: ${file.mimetype}. Only audio files are allowed.`,
                ),
              );
            }
          },
        });

        upload.single("file")(req, res, async (err: any) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }

          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          const fileData = {
            url: (req.file as any).location || req.file.path,
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
          };

          if (!fileData.url || fileData.url.trim() === "") {
            return res
              .status(400)
              .json({ message: "Upload failed: No URL generated" });
          }

          res.json(fileData);
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Failed to upload file" });
      }
    },
  );

  // Admin routes - File upload for alarm sounds
  app.post(
    "/api/admin/alarm-sounds/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req: any, res) => {
      try {
        const multer = await import("multer");
        const multerS3 = (await import("multer-s3")).default;
        const { S3Client } = await import("@aws-sdk/client-s3");
        const path = await import("path");

        const s3Client = new S3Client({
          region: process.env.AWS_REGION!,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const bucketName = process.env.AWS_S3_BUCKET_NAME!;

        const audioMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac",
        ];

        const upload = multer.default({
          storage: multerS3({
            s3: s3Client,
            bucket: bucketName,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: (req: any, file: any, cb: any) => {
              cb(null, { fieldName: file.fieldname });
            },
            key: (req: any, file: any, cb: any) => {
              const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
              const ext = path.default.extname(file.originalname);
              const basename = path.default.basename(file.originalname, ext);
              cb(null, `alarm-sounds/${basename}-${uniqueSuffix}${ext}`);
            },
          }) as any,
          limits: { fileSize: 10 * 1024 * 1024 },
          fileFilter: (req: any, file: any, cb: any) => {
            // Enhanced validation
            if (!audioMimeTypes.includes(file.mimetype)) {
              cb(
                new Error(
                  `Invalid file type for alarm sounds: ${file.mimetype}. Only audio files (MP3, WAV, OGG, AAC, M4A, FLAC) are allowed.`,
                ),
              );
              return;
            }

            // Additional security: check for dangerous file extensions
            const originalName = file.originalname || '';
            const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar', '.js', '.php', '.asp'];
            const hasDangerousExt = dangerousExtensions.some(ext =>
              originalName.toLowerCase().endsWith(ext)
            );

            if (hasDangerousExt) {
              cb(new Error("File type not allowed for security reasons."));
              return;
            }

            cb(null, true);
          },
        });

        upload.single("file")(req, res, async (err: any) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }

          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          const file = req.file as any;
          const fileData = {
            url: file.location || file.path,
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          };

          if (!fileData.url || fileData.url.trim() === "") {
            return res
              .status(400)
              .json({ message: "Upload failed: No URL generated" });
          }

          res.json(fileData);
        });
      } catch (error) {
        console.error("Error uploading alarm sound:", error);
        res.status(500).json({ message: "Failed to upload alarm sound" });
      }
    },
  );

  // Admin routes - Japa audio management
  app.get("/api/japa-audios", isAuthenticated, async (_req, res) => {
    try {
      const audios = await storage.getAllJapaAudios();
      res.json(audios);
    } catch (error) {
      console.error("Error getting japa audios:", error);
      res.status(500).json({ message: "Failed to fetch japa audios" });
    }
  });

  app.post(
    "/api/admin/japa-audios",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const validatedData = insertJapaAudioSchema.parse(req.body);
        const audio = await storage.createJapaAudio(validatedData);
        res.json(audio);
      } catch (error) {
        console.error("Error creating japa audio:", error);
        res.status(400).json({ message: "Invalid japa audio data" });
      }
    },
  );

  app.patch(
    "/api/admin/japa-audios/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const audio = await storage.updateJapaAudio(req.params.id, req.body);
        res.json(audio);
      } catch (error) {
        console.error("Error updating japa audio:", error);
        res.status(500).json({ message: "Failed to update japa audio" });
      }
    },
  );

  app.delete(
    "/api/admin/japa-audios/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const audio = await storage.getJapaAudioById(req.params.id);
        if (audio) {
          const { extractS3Key, deleteFromS3 } = await import("./s3-upload");
          const key = extractS3Key(audio.url);
          if (key) {
            await deleteFromS3(key);
          }
        }
        await storage.deleteJapaAudio(req.params.id);
        res.json({ message: "Japa audio deleted successfully" });
      } catch (error) {
        console.error("Error deleting japa audio:", error);
        res.status(500).json({ message: "Failed to delete japa audio" });
      }
    },
  );

  // Admin routes - File upload for japa audios
  app.post(
    "/api/admin/japa-audios/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req: any, res) => {
      try {
        const multer = await import("multer");
        const multerS3 = (await import("multer-s3")).default;
        const { S3Client } = await import("@aws-sdk/client-s3");
        const path = await import("path");

        const s3Client = new S3Client({
          region: process.env.AWS_REGION!,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const bucketName = process.env.AWS_S3_BUCKET_NAME!;

        const audioMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac",
        ];

        const upload = multer.default({
          storage: multerS3({
            s3: s3Client,
            bucket: bucketName,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: (req: any, file: any, cb: any) => {
              cb(null, { fieldName: file.fieldname });
            },
            key: (req: any, file: any, cb: any) => {
              const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
              const ext = path.default.extname(file.originalname);
              const basename = path.default.basename(file.originalname, ext);
              cb(null, `japa-audios/${basename}-${uniqueSuffix}${ext}`);
            },
          }) as any,
          limits: { fileSize: 10 * 1024 * 1024 },
          fileFilter: (req: any, file: any, cb: any) => {
            if (audioMimeTypes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(
                new Error(
                  `Invalid file type for japa audios: ${file.mimetype}. Only audio files are allowed.`,
                ),
              );
            }
          },
        });

        upload.single("file")(req, res, async (err: any) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }

          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          const fileData = {
            url: (req.file as any).location || req.file.path,
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
          };

          if (!fileData.url || fileData.url.trim() === "") {
            return res
              .status(400)
              .json({ message: "Upload failed: No URL generated" });
          }

          res.json(fileData);
        });
      } catch (error) {
        console.error("Error uploading japa audio:", error);
        res.status(500).json({ message: "Failed to upload japa audio" });
      }
    },
  );

  // User routes - Japa settings
  app.get("/api/japa-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      let settings = await storage.getJapaSettings(userId);

      if (!settings) {
        settings = await storage.upsertJapaSettings({
          userId,
          hapticEnabled: false,
          soundEnabled: true,
          dailyGoal: 108,
        });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error getting japa settings:", error);
      res.status(500).json({ message: "Failed to fetch japa settings" });
    }
  });

  app.patch("/api/japa-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const settings = await storage.upsertJapaSettings({
        userId,
        ...req.body,
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating japa settings:", error);
      res.status(500).json({ message: "Failed to update japa settings" });
    }
  });

  // User routes - Update japa count
  app.post("/api/japa/increment", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const today = new Date().toISOString().split("T")[0];
      const { count = 1 } = req.body;

      let progress = await storage.getSadhanaProgress(userId, today);

      if (!progress) {
        progress = await storage.upsertSadhanaProgress({
          userId,
          date: today,
          japCount: count,
          pratahCompleted: false,
          madhyahnaCompleted: false,
          sayamCompleted: false,
          mahapuranCompleted: false,
          japCompleted: false,
        });
      } else {
        progress = await storage.upsertSadhanaProgress({
          ...progress,
          japCount: progress.japCount + count,
        });
      }

      res.json(progress);
    } catch (error) {
      console.error("Error incrementing japa count:", error);
      res.status(500).json({ message: "Failed to increment japa count" });
    }
  });

  // Admin routes - Scripture management
  app.post(
    "/api/admin/scriptures",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const validatedData = insertScriptureContentSchema.parse(req.body);
        const scripture = await storage.createScripture(validatedData);
        res.json(scripture);
      } catch (error) {
        console.error("Error creating scripture:", error);
        res.status(400).json({ message: "Invalid scripture data" });
      }
    },
  );

  app.patch(
    "/api/admin/scriptures/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const scripture = await storage.updateScripture(
          req.params.id,
          req.body,
        );
        res.json(scripture);
      } catch (error) {
        console.error("Error updating scripture:", error);
        res.status(500).json({ message: "Failed to update scripture" });
      }
    },
  );

  app.delete(
    "/api/admin/scriptures/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteScripture(req.params.id);
        res.json({ message: "Scripture deleted successfully" });
      } catch (error) {
        console.error("Error deleting scripture:", error);
        res.status(500).json({ message: "Failed to delete scripture" });
      }
    },
  );

  // Admin routes - Sadhana content management
  app.get("/api/sadhana-content", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const content = await storage.getAllSadhanaContent(category);
      res.json(content);
    } catch (error) {
      console.error("Error fetching sadhana content:", error);
      res.status(500).json({ message: "Failed to fetch sadhana content" });
    }
  });

  app.post(
    "/api/admin/sadhana-content",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertSadhanaContentSchema } = await import("@shared/schema");
        const validatedData = insertSadhanaContentSchema.parse(req.body);
        const content = await storage.createSadhanaContent(validatedData);
        res.json(content);
      } catch (error) {
        console.error("Error creating sadhana content:", error);
        res.status(400).json({ message: "Invalid sadhana content data" });
      }
    },
  );

  app.patch(
    "/api/admin/sadhana-content/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const content = await storage.updateSadhanaContent(
          req.params.id,
          req.body,
        );
        res.json(content);
      } catch (error) {
        console.error("Error updating sadhana content:", error);
        res.status(500).json({ message: "Failed to update sadhana content" });
      }
    },
  );

  app.delete(
    "/api/admin/sadhana-content/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteSadhanaContent(req.params.id);
        res.json({ message: "Sadhana content deleted successfully" });
      } catch (error) {
        console.error("Error deleting sadhana content:", error);
        res.status(500).json({ message: "Failed to delete sadhana content" });
      }
    },
  );

  // Alarm sounds routes
  app.get("/api/alarm-sounds", isAuthenticated, async (req, res) => {
    try {
      const sounds = await storage.getAllAlarmSounds();
      res.json(sounds);
    } catch (error) {
      console.error("Error fetching alarm sounds:", error);
      res.status(500).json({ message: "Failed to fetch alarm sounds" });
    }
  });

  app.post(
    "/api/admin/alarm-sounds",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertAlarmSoundSchema } = await import("@shared/schema");
        const validatedData = insertAlarmSoundSchema.parse(req.body);
        const sound = await storage.createAlarmSound(validatedData);
        res.json(sound);
      } catch (error) {
        console.error("Error creating alarm sound:", error);
        res.status(400).json({ message: "Invalid alarm sound data" });
      }
    },
  );

  app.patch(
    "/api/admin/alarm-sounds/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const sound = await storage.updateAlarmSound(req.params.id, req.body);
        res.json(sound);
      } catch (error) {
        console.error("Error updating alarm sound:", error);
        res.status(500).json({ message: "Failed to update alarm sound" });
      }
    },
  );

  app.delete(
    "/api/admin/alarm-sounds/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const sound = await storage.getAlarmSoundById(req.params.id);
        if (sound) {
          const { extractS3Key, deleteFromS3 } = await import("./s3-upload");
          const key = extractS3Key(sound.url);
          if (key) {
            await deleteFromS3(key);
          }
        }
        await storage.deleteAlarmSound(req.params.id);
        res.json({ message: "Alarm sound deleted successfully" });
      } catch (error) {
        console.error("Error deleting alarm sound:", error);
        res.status(500).json({ message: "Failed to delete alarm sound" });
      }
    },
  );

  // Mahapuran titles routes (public)
  app.get("/api/mahapuran-titles", async (req, res) => {
    try {
      const titles = await storage.getAllMahapuranTitles("mahapuran");
      res.json(titles);
    } catch (error) {
      console.error("Error fetching mahapuran titles:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran titles" });
    }
  });

  // Scripture titles routes (public) - For non-Mahapuran scriptures
  app.get("/api/scripture-titles", async (req, res) => {
    try {
      const titles = await storage.getAllMahapuranTitles("other");
      res.json(titles);
    } catch (error) {
      console.error("Error fetching scripture titles:", error);
      res.status(500).json({ message: "Failed to fetch scripture titles" });
    }
  });

  app.get("/api/mahapuran-titles/:id", async (req, res) => {
    try {
      const title = await storage.getMahapuranTitleById(req.params.id);
      if (!title) {
        return res.status(404).json({ message: "Mahapuran title not found" });
      }
      res.json(title);
    } catch (error) {
      console.error("Error fetching mahapuran title:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran title" });
    }
  });

  // Mahapuran skandas routes (public)
  app.get("/api/mahapuran-skandas", async (req, res) => {
    try {
      const titleId = req.query.mahapuranTitleId as string | undefined;
      const skandas = await storage.getAllMahapuranSkandas(titleId);
      res.json(skandas);
    } catch (error) {
      console.error("Error fetching mahapuran skandas:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran skandas" });
    }
  });

  app.get("/api/mahapuran-skandas/:id", async (req, res) => {
    try {
      const skanda = await storage.getMahapuranSkandaById(req.params.id);
      if (!skanda) {
        return res.status(404).json({ message: "Mahapuran skanda not found" });
      }
      res.json(skanda);
    } catch (error) {
      console.error("Error fetching mahapuran skanda:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran skanda" });
    }
  });

  // Mahapuran chapters routes (public)
  app.get("/api/mahapuran-chapters", async (req, res) => {
    try {
      const skandaId = req.query.skandaId as string | undefined;
      const chapters = await storage.getAllMahapuranChapters(skandaId);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching mahapuran chapters:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran chapters" });
    }
  });

  app.get("/api/mahapuran-chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.getMahapuranChapterById(req.params.id);
      if (!chapter) {
        return res.status(404).json({ message: "Mahapuran chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      console.error("Error fetching mahapuran chapter:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran chapter" });
    }
  });

  // Admin routes - Mahapuran titles management
  app.post(
    "/api/admin/mahapuran-titles",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranTitleSchema } = await import("@shared/schema");
        const validatedData = insertMahapuranTitleSchema.parse(req.body);
        const title = await storage.createMahapuranTitle(validatedData);
        res.json(title);
      } catch (error) {
        console.error("Error creating mahapuran title:", error);
        res.status(400).json({ message: "Invalid mahapuran title data" });
      }
    },
  );

  app.patch(
    "/api/admin/mahapuran-titles/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const title = await storage.updateMahapuranTitle(
          req.params.id,
          req.body,
        );
        res.json(title);
      } catch (error) {
        console.error("Error updating mahapuran title:", error);
        res.status(500).json({ message: "Failed to update mahapuran title" });
      }
    },
  );

  app.delete(
    "/api/admin/mahapuran-titles/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteMahapuranTitle(req.params.id);
        res.json({ message: "Mahapuran title deleted successfully" });
      } catch (error) {
        console.error("Error deleting mahapuran title:", error);
        res.status(500).json({ message: "Failed to delete mahapuran title" });
      }
    },
  );

  // Admin routes - Mahapuran skandas management
  app.post(
    "/api/admin/mahapuran-skandas",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranSkandaSchema } = await import("@shared/schema");
        const validatedData = insertMahapuranSkandaSchema.parse(req.body);
        const skanda = await storage.createMahapuranSkanda(validatedData);
        res.json(skanda);
      } catch (error) {
        console.error("Error creating mahapuran skanda:", error);
        res.status(400).json({ message: "Invalid mahapuran skanda data" });
      }
    },
  );

  app.patch(
    "/api/admin/mahapuran-skandas/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const skanda = await storage.updateMahapuranSkanda(
          req.params.id,
          req.body,
        );
        res.json(skanda);
      } catch (error) {
        console.error("Error updating mahapuran skanda:", error);
        res.status(500).json({ message: "Failed to update mahapuran skanda" });
      }
    },
  );

  app.delete(
    "/api/admin/mahapuran-skandas/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteMahapuranSkanda(req.params.id);
        res.json({ message: "Mahapuran skanda deleted successfully" });
      } catch (error) {
        console.error("Error deleting mahapuran skanda:", error);
        res.status(500).json({ message: "Failed to delete mahapuran skanda" });
      }
    },
  );

  // Admin routes - Mahapuran chapters management
  app.post(
    "/api/admin/mahapuran-chapters",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranChapterSchema } = await import("@shared/schema");
        const validatedData = insertMahapuranChapterSchema.parse(req.body);
        const chapter = await storage.createMahapuranChapter(validatedData);
        res.json(chapter);
      } catch (error) {
        console.error("Error creating mahapuran chapter:", error);
        res.status(400).json({ message: "Invalid mahapuran chapter data" });
      }
    },
  );

  app.patch(
    "/api/admin/mahapuran-chapters/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const chapter = await storage.updateMahapuranChapter(
          req.params.id,
          req.body,
        );
        res.json(chapter);
      } catch (error) {
        console.error("Error updating mahapuran chapter:", error);
        res.status(500).json({ message: "Failed to update mahapuran chapter" });
      }
    },
  );

  app.delete(
    "/api/admin/mahapuran-chapters/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteMahapuranChapter(req.params.id);
        res.json({ message: "Mahapuran chapter deleted successfully" });
      } catch (error) {
        console.error("Error deleting mahapuran chapter:", error);
        res.status(500).json({ message: "Failed to delete mahapuran chapter" });
      }
    },
  );

  // Admin routes - File upload for mahapuran chapters
  app.post(
    "/api/admin/mahapuran-chapters/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req: any, res) => {
      try {
        const multer = await import("multer");
        const multerS3 = (await import("multer-s3")).default;
        const { S3Client } = await import("@aws-sdk/client-s3");

        const s3Client = new S3Client({
          region: process.env.AWS_REGION || "us-east-1",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const upload = multer.default({
          storage: multerS3({
            s3: s3Client,
            bucket: process.env.AWS_S3_BUCKET_NAME!,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req: any, file: any, cb: any) => {
              const fileName = `mahapuran-chapters/${file.originalname}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
              cb(null, fileName);
            },
          }),
          limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        });

        upload.single("file")(req, res, async (err: any) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }

          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          try {
            const { skandaId, chapterNumber, title, summary } = req.body;
            const fileUrl = (req.file as any).location;
            const fileType = req.file.mimetype;
            let content = "";

            // Try to extract text for display, but always keep the file URL
            const fileName = req.file.originalname.toLowerCase();

            if (fileType === "text/plain" || fileName.endsWith(".txt")) {
              // For text files, download and extract content
              const { GetObjectCommand } = await import("@aws-sdk/client-s3");
              const command = new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: (req.file as any).key,
              });
              const response = await s3Client.send(command);
              const bodyContents = await response.Body?.transformToString();
              content = bodyContents || "Content could not be extracted";
            } else if (
              fileType === "application/pdf" ||
              fileName.endsWith(".pdf")
            ) {
              content =
                "PDF file uploaded. Click 'View File' to open the PDF document.";
            } else if (
              fileType === "application/msword" ||
              fileType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              fileName.endsWith(".doc") ||
              fileName.endsWith(".docx")
            ) {
              content =
                "Word document uploaded. Click 'View File' to open the document.";
            } else {
              content = "File uploaded. Click 'View File' to open.";
            }

            // Create the chapter with file URL and content
            const { insertMahapuranChapterSchema } = await import(
              "@shared/schema"
            );
            const chapterData = {
              skandaId,
              chapterNumber: parseInt(chapterNumber),
              title,
              summary: summary || null,
              content: content.trim(),
              fileUrl,
              fileType,
            };

            const validatedData =
              insertMahapuranChapterSchema.parse(chapterData);
            const chapter = await storage.createMahapuranChapter(validatedData);

            res.json({
              message: "Chapter uploaded and created successfully",
              chapter,
            });
          } catch (error) {
            console.error("Error processing chapter file:", error);
            res.status(500).json({ message: "Failed to process chapter file" });
          }
        });
      } catch (error) {
        console.error("Error uploading chapter file:", error);
        res.status(500).json({ message: "Failed to upload chapter file" });
      }
    },
  );

  // User media favorites routes
  app.get("/api/media-favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const favorites = await storage.getUserMediaFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching media favorites:", error);
      res.status(500).json({ message: "Failed to fetch media favorites" });
    }
  });

  app.post("/api/media-favorites", isAuthenticated, async (req, res) => {
    try {
      const { insertUserMediaFavoriteSchema } = await import("@shared/schema");
      const validatedData = insertUserMediaFavoriteSchema.parse({
        userId: (req.user as any).id,
        mediaId: req.body.mediaId,
      });
      const favorite = await storage.addMediaFavorite(validatedData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding media favorite:", error);
      res.status(400).json({ message: "Failed to add media favorite" });
    }
  });

  app.delete(
    "/api/media-favorites/:mediaId",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        await storage.removeMediaFavorite(userId, req.params.mediaId);
        res.json({ message: "Media favorite removed successfully" });
      } catch (error) {
        console.error("Error removing media favorite:", error);
        res.status(500).json({ message: "Failed to remove media favorite" });
      }
    },
  );

  app.get(
    "/api/media-favorites/:mediaId/check",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        const isFavorited = await storage.isMediaFavorited(
          userId,
          req.params.mediaId,
        );
        res.json({ isFavorited });
      } catch (error) {
        console.error("Error checking media favorite:", error);
        res.status(500).json({ message: "Failed to check media favorite" });
      }
    },
  );

  // Mahapuran PDF routes
  app.get("/api/mahapuran-pdfs", async (req, res) => {
    try {
      const pdfs = await storage.getAllMahapuranPdfs();
      res.json(pdfs);
    } catch (error) {
      console.error("Error fetching Mahapuran PDFs:", error);
      res.status(500).json({ message: "Failed to fetch Mahapuran PDFs" });
    }
  });

  app.get("/api/mahapuran-pdfs/:id", async (req, res) => {
    try {
      const pdf = await storage.getMahapuranPdfById(req.params.id);
      if (!pdf) {
        return res.status(404).json({ message: "Mahapuran PDF not found" });
      }
      res.json(pdf);
    } catch (error) {
      console.error("Error fetching Mahapuran PDF:", error);
      res.status(500).json({ message: "Failed to fetch Mahapuran PDF" });
    }
  });

  app.get("/api/mahapuran-pdfs/language/:languageCode", async (req, res) => {
    try {
      const pdf = await storage.getMahapuranPdfByLanguage(
        req.params.languageCode,
      );
      if (!pdf) {
        return res
          .status(404)
          .json({ message: "Mahapuran PDF not found for this language" });
      }
      res.json(pdf);
    } catch (error) {
      console.error("Error fetching Mahapuran PDF by language:", error);
      res.status(500).json({ message: "Failed to fetch Mahapuran PDF" });
    }
  });

  app.post(
    "/api/mahapuran-pdfs",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranPdfSchema } = await import("@shared/schema");
        const validatedData = insertMahapuranPdfSchema.parse(req.body);
        const pdf = await storage.createMahapuranPdf(validatedData);
        res.json(pdf);
      } catch (error) {
        console.error("Error creating Mahapuran PDF:", error);
        res.status(400).json({ message: "Failed to create Mahapuran PDF" });
      }
    },
  );

  app.patch(
    "/api/mahapuran-pdfs/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const pdf = await storage.updateMahapuranPdf(req.params.id, req.body);
        res.json(pdf);
      } catch (error) {
        console.error("Error updating Mahapuran PDF:", error);
        res.status(400).json({ message: "Failed to update Mahapuran PDF" });
      }
    },
  );

  app.delete(
    "/api/mahapuran-pdfs/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const pdf = await storage.getMahapuranPdfById(req.params.id);
        if (pdf && pdf.pdfKey) {
          await deleteFromS3(pdf.pdfKey);
        }
        await storage.deleteMahapuranPdf(req.params.id);
        res.json({ message: "Mahapuran PDF deleted successfully" });
      } catch (error) {
        console.error("Error deleting Mahapuran PDF:", error);
        res.status(500).json({ message: "Failed to delete Mahapuran PDF" });
      }
    },
  );

  app.post(
    "/api/mahapuran-pdfs/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    (req: any, res) => {
      req.uploadFolder = "mahapuran-pdfs";

      uploadToS3.single("pdf")(req, res, async (err: any) => {
        if (err) {
          console.error("Error uploading PDF:", err);
          return res
            .status(400)
            .json({ message: err.message || "Failed to upload PDF" });
        }

        try {
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          const file = req.file as any;
          const pdfUrl = file.location;
          const pdfKey = file.key;
          const fileSize = file.size;

          res.json({
            message: "PDF uploaded successfully",
            pdfUrl,
            pdfKey,
            fileSize,
          });
        } catch (error) {
          console.error("Error processing PDF upload:", error);
          res.status(500).json({ message: "Failed to process PDF upload" });
        }
      });
    },
  );

  // Trisandhya PDF routes
  app.get("/api/trisandhya-pdfs", async (req, res) => {
    try {
      const pdfs = await storage.getAllTrisandhyaPdfs();
      res.json(pdfs);
    } catch (error) {
      console.error("Error fetching Trisandhya PDFs:", error);
      res.status(500).json({ message: "Failed to fetch Trisandhya PDFs" });
    }
  });

  app.get("/api/trisandhya-pdfs/:id", async (req, res) => {
    try {
      const pdf = await storage.getTrisandhyaPdfById(req.params.id);
      if (!pdf) {
        return res.status(404).json({ message: "Trisandhya PDF not found" });
      }
      res.json(pdf);
    } catch (error) {
      console.error("Error fetching Trisandhya PDF:", error);
      res.status(500).json({ message: "Failed to fetch Trisandhya PDF" });
    }
  });

  app.post(
    "/api/trisandhya-pdfs",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertTrisandhyaPdfSchema } = await import("@shared/schema");
        const validatedData = insertTrisandhyaPdfSchema.parse(req.body);
        const pdf = await storage.createTrisandhyaPdf(validatedData);
        res.json(pdf);
      } catch (error) {
        console.error("Error creating Trisandhya PDF:", error);
        res.status(400).json({ message: "Failed to create Trisandhya PDF" });
      }
    },
  );

  app.patch(
    "/api/trisandhya-pdfs/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const pdf = await storage.updateTrisandhyaPdf(req.params.id, req.body);
        res.json(pdf);
      } catch (error) {
        console.error("Error updating Trisandhya PDF:", error);
        res.status(400).json({ message: "Failed to update Trisandhya PDF" });
      }
    },
  );

  app.delete(
    "/api/trisandhya-pdfs/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const pdf = await storage.getTrisandhyaPdfById(req.params.id);
        if (pdf && pdf.pdfKey) {
          await deleteFromS3(pdf.pdfKey);
        }
        await storage.deleteTrisandhyaPdf(req.params.id);
        res.json({ message: "Trisandhya PDF deleted successfully" });
      } catch (error) {
        console.error("Error deleting Trisandhya PDF:", error);
        res.status(500).json({ message: "Failed to delete Trisandhya PDF" });
      }
    },
  );

  app.post(
    "/api/trisandhya-pdfs/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    (req: any, res) => {
      req.uploadFolder = "trisandhya-pdfs";

      uploadToS3.single("pdf")(req, res, async (err: any) => {
        if (err) {
          console.error("Error uploading PDF:", err);
          return res
            .status(400)
            .json({ message: err.message || "Failed to upload PDF" });
        }

        try {
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          const file = req.file as any;
          const pdfUrl = file.location;
          const pdfKey = file.key;
          const fileSize = file.size;

          res.json({
            message: "PDF uploaded successfully",
            pdfUrl,
            pdfKey,
            fileSize,
          });
        } catch (error) {
          console.error("Error processing PDF upload:", error);
          res.status(500).json({ message: "Failed to process PDF upload" });
        }
      });
    },
  );

  // Scripture PDF routes
  app.get("/api/scripture-pdfs", async (req, res) => {
    try {
      const pdfs = await storage.getAllScripturePdfs();
      res.json(pdfs);
    } catch (error) {
      console.error("Error fetching Scripture PDFs:", error);
      res.status(500).json({ message: "Failed to fetch Scripture PDFs" });
    }
  });

  app.get("/api/scripture-pdfs/:id", async (req, res) => {
    try {
      const pdf = await storage.getScripturePdfById(req.params.id);
      if (!pdf) {
        return res.status(404).json({ message: "Scripture PDF not found" });
      }
      res.json(pdf);
    } catch (error) {
      console.error("Error fetching Scripture PDF:", error);
      res.status(500).json({ message: "Failed to fetch Scripture PDF" });
    }
  });

  app.post(
    "/api/scripture-pdfs",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertScripturePdfSchema } = await import("@shared/schema");
        const validatedData = insertScripturePdfSchema.parse(req.body);
        const pdf = await storage.createScripturePdf(validatedData);
        res.json(pdf);
      } catch (error) {
        console.error("Error creating Scripture PDF:", error);
        res.status(400).json({ message: "Failed to create Scripture PDF" });
      }
    },
  );

  app.patch(
    "/api/scripture-pdfs/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const pdf = await storage.updateScripturePdf(req.params.id, req.body);
        res.json(pdf);
      } catch (error) {
        console.error("Error updating Scripture PDF:", error);
        res.status(400).json({ message: "Failed to update Scripture PDF" });
      }
    },
  );

  app.delete(
    "/api/scripture-pdfs/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const pdf = await storage.getScripturePdfById(req.params.id);
        if (pdf && pdf.pdfKey) {
          await deleteFromS3(pdf.pdfKey);
        }
        await storage.deleteScripturePdf(req.params.id);
        res.json({ message: "Scripture PDF deleted successfully" });
      } catch (error) {
        console.error("Error deleting Scripture PDF:", error);
        res.status(500).json({ message: "Failed to delete Scripture PDF" });
      }
    },
  );

  app.post(
    "/api/scripture-pdfs/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    (req: any, res) => {
      req.uploadFolder = "scripture-pdfs";

      uploadToS3.single("pdf")(req, res, async (err: any) => {
        if (err) {
          console.error("Error uploading PDF:", err);
          return res
            .status(400)
            .json({ message: err.message || "Failed to upload PDF" });
        }

        try {
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          const file = req.file as any;
          const pdfUrl = file.location;
          const pdfKey = file.key;
          const fileSize = file.size;

          res.json({
            message: "PDF uploaded successfully",
            pdfUrl,
            pdfKey,
            fileSize,
          });
        } catch (error) {
          console.error("Error processing PDF upload:", error);
          res.status(500).json({ message: "Failed to process PDF upload" });
        }
      });
    },
  );

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const notifications = await storage.getUserNotifications(userId, 50);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get(
    "/api/notifications/unread-count",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        const count = await storage.getUnreadNotificationCount(userId);
        res.json({ count });
      } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
      }
    },
  );

  app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.markNotificationAsRead(userId, req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res
        .status(500)
        .json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Admin notification routes
  app.get(
    "/api/admin/notifications",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const notifications = await storage.getAllNotifications();
        res.json(notifications);
      } catch (error) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
      }
    },
  );

  app.post(
    "/api/admin/notifications",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertNotificationSchema } = await import("@shared/schema");
        const validatedData = insertNotificationSchema.parse(req.body);
        const notification = await storage.createNotification(validatedData);

        if (validatedData.sendToAll) {
          const users = await storage.getAllUsers();
          for (const user of users) {
            await storage.createNotificationReceipt({
              notificationId: notification.id,
              userId: user.id,
            });

            // Broadcast notification via WebSocket for real-time delivery
            if ((app as any).broadcastNotification) {
              (app as any).broadcastNotification(user.id, {
                notification,
                receipt: {
                  notificationId: notification.id,
                  userId: user.id,
                  isRead: false,
                },
              });
            }
          }
        }

        res.json(notification);
      } catch (error) {
        console.error("Error creating notification:", error);
        if (error instanceof Error) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(400).json({ message: "Failed to create notification" });
        }
      }
    },
  );

  app.delete(
    "/api/admin/notifications/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteNotification(req.params.id);
        res.json({ message: "Notification deleted successfully" });
      } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Failed to delete notification" });
      }
    },
  );

  // Notification preferences routes
  app.get(
    "/api/notification-preferences",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        let prefs = await storage.getNotificationPreferences(userId);

        if (!prefs) {
          prefs = await storage.createNotificationPreferences({
            userId,
            pushEnabled: true,
            inAppEnabled: true,
            emailEnabled: false,
          });
        }

        res.json(prefs);
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch notification preferences" });
      }
    },
  );

  app.patch(
    "/api/notification-preferences",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        const prefs = await storage.updateNotificationPreferences(
          userId,
          req.body,
        );
        res.json(prefs);
      } catch (error) {
        console.error("Error updating notification preferences:", error);
        res
          .status(400)
          .json({ message: "Failed to update notification preferences" });
      }
    },
  );

  // Push subscription routes
  app.post("/api/push-subscriptions", isAuthenticated, async (req, res) => {
    try {
      const { insertPushSubscriptionSchema } = await import("@shared/schema");
      const validatedData = insertPushSubscriptionSchema.parse({
        userId: (req.user as any).id,
        ...req.body,
      });
      const subscription = await storage.createPushSubscription(validatedData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating push subscription:", error);
      res.status(400).json({ message: "Failed to create push subscription" });
    }
  });

  app.delete("/api/push-subscriptions", isAuthenticated, async (req, res) => {
    try {
      const { endpoint } = req.body;
      await storage.deletePushSubscription(endpoint);
      res.json({ message: "Push subscription deleted successfully" });
    } catch (error) {
      console.error("Error deleting push subscription:", error);
      res.status(500).json({ message: "Failed to delete push subscription" });
    }
  });

  // Notification sounds routes
  app.get("/api/notification-sounds", isAuthenticated, async (req, res) => {
    try {
      const sounds = await storage.getAllNotificationSounds();
      res.json(sounds);
    } catch (error) {
      console.error("Error fetching notification sounds:", error);
      res.status(500).json({ message: "Failed to fetch notification sounds" });
    }
  });

  app.post(
    "/api/notification-sounds",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertNotificationSoundSchema } = await import(
          "@shared/schema"
        );
        const validatedData = insertNotificationSoundSchema.parse(req.body);
        const sound = await storage.createNotificationSound(validatedData);
        res.json(sound);
      } catch (error) {
        console.error("Error creating notification sound:", error);
        res
          .status(400)
          .json({ message: "Failed to create notification sound" });
      }
    },
  );

  const httpServer = createServer(app);

  // WebSocket server for real-time notifications
  const { WebSocketServer } = await import("ws");
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/notifications",
  });

  // Store connected clients with their user IDs
  const notificationClients = new Map<string, Set<any>>();

  wss.on("connection", (ws, req) => {
    let userId: string | null = null;

    ws.on("message", async (message) => {
      try {
        const rawMessage = message.toString();

        // Basic validation - ensure it's valid JSON and not too large
        if (rawMessage.length > 10000) {
          ws.send(JSON.stringify({ type: "error", message: "Message too large" }));
          return;
        }

        const data = JSON.parse(rawMessage);

        // Validate message structure
        if (typeof data !== 'object' || !data.type) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
          return;
        }

        if (data.type === "authenticate" && data.userId) {
          // Validate userId format
          if (typeof data.userId !== 'string' || data.userId.length > 100) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid userId" }));
            return;
          }

          userId = data.userId as string;

          // Add client to user's connection set
          if (!notificationClients.has(userId)) {
            notificationClients.set(userId, new Set());
          }
          notificationClients.get(userId)?.add(ws);

          console.log(`[WS] User ${userId} connected for notifications`);

          // Send confirmation
          ws.send(JSON.stringify({ type: "authenticated", userId }));
        }
      } catch (error) {
        console.error("[WS] Error processing message:", error);
        ws.send(JSON.stringify({ type: "error", message: "Failed to process message" }));
      }
    });

    ws.on("close", () => {
      if (userId && notificationClients.has(userId)) {
        notificationClients.get(userId)!.delete(ws);
        if (notificationClients.get(userId)!.size === 0) {
          notificationClients.delete(userId);
        }
        console.log(`[WS] User ${userId} disconnected from notifications`);
      }
    });

    ws.on("error", (error) => {
      console.error("[WS] WebSocket error:", error);
    });
  });

  // Export function to broadcast notifications to users
  (app as any).broadcastNotification = (userId: string, notification: any) => {
    if (notificationClients.has(userId)) {
      const clients = notificationClients.get(userId)!;
      const message = JSON.stringify({
        type: "new_notification",
        notification,
      });

      clients.forEach((client) => {
        if (client.readyState === 1) {
          // OPEN
          client.send(message);
        }
      });
    }
  };

  return httpServer;
}
