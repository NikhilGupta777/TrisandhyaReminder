import {
  users,
  alarmSettings,
  sadhanaProgress,
  mediaContent,
  scriptureContent,
  type User,
  type UpsertUser,
  type AlarmSettings,
  type InsertAlarmSettings,
  type SadhanaProgress,
  type InsertSadhanaProgress,
  type MediaContent,
  type InsertMediaContent,
  type ScriptureContent,
  type InsertScriptureContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  verifyUserEmail(token: string): Promise<User | undefined>;
  verifyUserCode(email: string, code: string): Promise<User | undefined>;
  setResetPasswordCode(email: string, code: string): Promise<User | undefined>;
  resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<User | undefined>;
  
  // Alarm settings
  getAlarmSettings(userId: number): Promise<AlarmSettings | undefined>;
  upsertAlarmSettings(settings: InsertAlarmSettings): Promise<AlarmSettings>;
  
  // Sadhana progress
  getSadhanaProgress(userId: number, date: string): Promise<SadhanaProgress | undefined>;
  getSadhanaProgressByDateRange(userId: number, startDate: string, endDate: string): Promise<SadhanaProgress[]>;
  upsertSadhanaProgress(progress: InsertSadhanaProgress): Promise<SadhanaProgress>;
  getUserStats(userId: number): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalJapCount: number;
    completedDays: number;
  }>;
  
  // Media content
  getAllMedia(type?: string): Promise<MediaContent[]>;
  getMediaById(id: number): Promise<MediaContent | undefined>;
  createMedia(media: InsertMediaContent): Promise<MediaContent>;
  updateMedia(id: number, media: Partial<InsertMediaContent>): Promise<MediaContent>;
  deleteMedia(id: number): Promise<void>;
  
  // Scripture content
  getAllScriptures(): Promise<ScriptureContent[]>;
  getScriptureByChapter(chapterNumber: number): Promise<ScriptureContent | undefined>;
  createScripture(scripture: InsertScriptureContent): Promise<ScriptureContent>;
  updateScripture(id: number, scripture: Partial<InsertScriptureContent>): Promise<ScriptureContent>;
  deleteScripture(id: number): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(userId: number, isAdmin: boolean): Promise<User>;
  deleteUser(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLocalUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async verifyUserEmail(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));
    
    if (!user) {
      return undefined;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  async verifyUserCode(email: string, code: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return undefined;
    }

    if (user.verificationCode !== code) {
      return undefined;
    }

    if (new Date() > user.verificationCodeExpiry) {
      return undefined;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  async setResetPasswordCode(email: string, code: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      return undefined;
    }

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    const [updatedUser] = await db
      .update(users)
      .set({
        resetPasswordCode: code,
        resetPasswordCodeExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user || !user.resetPasswordCode || !user.resetPasswordCodeExpiry) {
      return undefined;
    }

    if (user.resetPasswordCode !== code) {
      return undefined;
    }

    if (new Date() > user.resetPasswordCodeExpiry) {
      return undefined;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        password: newPassword,
        resetPasswordCode: null,
        resetPasswordCodeExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  // Alarm settings
  async getAlarmSettings(userId: number): Promise<AlarmSettings | undefined> {
    const [settings] = await db
      .select()
      .from(alarmSettings)
      .where(eq(alarmSettings.userId, userId));
    return settings;
  }

  async upsertAlarmSettings(settingsData: InsertAlarmSettings): Promise<AlarmSettings> {
    const existing = await this.getAlarmSettings(settingsData.userId);
    
    if (existing) {
      const [updated] = await db
        .update(alarmSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(alarmSettings.userId, settingsData.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(alarmSettings)
        .values(settingsData)
        .returning();
      return created;
    }
  }

  // Sadhana progress
  async getSadhanaProgress(userId: number, date: string): Promise<SadhanaProgress | undefined> {
    const [progress] = await db
      .select()
      .from(sadhanaProgress)
      .where(and(eq(sadhanaProgress.userId, userId), eq(sadhanaProgress.date, date)));
    return progress;
  }

  async getSadhanaProgressByDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<SadhanaProgress[]> {
    return await db
      .select()
      .from(sadhanaProgress)
      .where(eq(sadhanaProgress.userId, userId))
      .orderBy(desc(sadhanaProgress.date));
  }

  async upsertSadhanaProgress(progressData: InsertSadhanaProgress): Promise<SadhanaProgress> {
    const existing = await this.getSadhanaProgress(progressData.userId, progressData.date);
    
    if (existing) {
      const [updated] = await db
        .update(sadhanaProgress)
        .set({ ...progressData, updatedAt: new Date() })
        .where(and(
          eq(sadhanaProgress.userId, progressData.userId),
          eq(sadhanaProgress.date, progressData.date)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(sadhanaProgress)
        .values(progressData)
        .returning();
      return created;
    }
  }

  async getUserStats(userId: number): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalJapCount: number;
    completedDays: number;
  }> {
    const allProgress = await db
      .select()
      .from(sadhanaProgress)
      .where(eq(sadhanaProgress.userId, userId))
      .orderBy(desc(sadhanaProgress.date));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalJapCount = 0;
    let completedDays = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < allProgress.length; i++) {
      const progress = allProgress[i];
      totalJapCount += progress.japCount;

      const isCompleted = progress.pratahCompleted || progress.madhyahnaCompleted || progress.sayamCompleted;
      
      if (isCompleted) {
        completedDays++;
        tempStreak++;
        
        if (i === 0) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return { currentStreak, longestStreak, totalJapCount, completedDays };
  }

  // Media content
  async getAllMedia(type?: string): Promise<MediaContent[]> {
    if (type) {
      return await db
        .select()
        .from(mediaContent)
        .where(eq(mediaContent.type, type))
        .orderBy(desc(mediaContent.createdAt));
    }
    return await db.select().from(mediaContent).orderBy(desc(mediaContent.createdAt));
  }

  async getMediaById(id: number): Promise<MediaContent | undefined> {
    const [media] = await db.select().from(mediaContent).where(eq(mediaContent.id, id));
    return media;
  }

  async createMedia(mediaData: InsertMediaContent): Promise<MediaContent> {
    const [media] = await db.insert(mediaContent).values(mediaData).returning();
    return media;
  }

  async updateMedia(id: number, mediaData: Partial<InsertMediaContent>): Promise<MediaContent> {
    const [updated] = await db
      .update(mediaContent)
      .set({ ...mediaData, updatedAt: new Date() })
      .where(eq(mediaContent.id, id))
      .returning();
    return updated;
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(mediaContent).where(eq(mediaContent.id, id));
  }

  // Scripture content
  async getAllScriptures(): Promise<ScriptureContent[]> {
    return await db.select().from(scriptureContent).orderBy(scriptureContent.chapterNumber);
  }

  async getScriptureByChapter(chapterNumber: number): Promise<ScriptureContent | undefined> {
    const [scripture] = await db
      .select()
      .from(scriptureContent)
      .where(eq(scriptureContent.chapterNumber, chapterNumber));
    return scripture;
  }

  async createScripture(scriptureData: InsertScriptureContent): Promise<ScriptureContent> {
    const [scripture] = await db.insert(scriptureContent).values(scriptureData).returning();
    return scripture;
  }

  async updateScripture(id: number, scriptureData: Partial<InsertScriptureContent>): Promise<ScriptureContent> {
    const [updated] = await db
      .update(scriptureContent)
      .set({ ...scriptureData, updatedAt: new Date() })
      .where(eq(scriptureContent.id, id))
      .returning();
    return updated;
  }

  async deleteScripture(id: number): Promise<void> {
    await db.delete(scriptureContent).where(eq(scriptureContent.id, id));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserAdminStatus(userId: number, isAdmin: boolean): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
