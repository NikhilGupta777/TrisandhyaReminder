import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import {
  insertAlarmSettingsSchema,
  insertSadhanaProgressSchema,
  insertMediaContentSchema,
  insertScriptureContentSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/sadhana-progress/range", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const user = await storage.updateUserAdminStatus(req.params.id, adminStatus);
      res.json(user);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
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
      const media = await storage.updateMedia(req.params.id, req.body);
      res.json(media);
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  app.delete("/api/admin/media/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteMedia(req.params.id);
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
      const scripture = await storage.updateScripture(req.params.id, req.body);
      res.json(scripture);
    } catch (error) {
      console.error("Error updating scripture:", error);
      res.status(500).json({ message: "Failed to update scripture" });
    }
  });

  app.delete("/api/admin/scriptures/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteScripture(req.params.id);
      res.json({ message: "Scripture deleted successfully" });
    } catch (error) {
      console.error("Error deleting scripture:", error);
      res.status(500).json({ message: "Failed to delete scripture" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
