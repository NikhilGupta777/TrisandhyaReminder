import {
  users,
  alarmSettings,
  sadhanaProgress,
  mediaCategories,
  mediaContent,
  scriptureContent,
  sadhanaContent,
  alarmSounds,
  registrationAttempts,
  type User,
  type UpsertUser,
  type AlarmSettings,
  type InsertAlarmSettings,
  type SadhanaProgress,
  type InsertSadhanaProgress,
  type MediaCategory,
  type InsertMediaCategory,
  type MediaContent,
  type InsertMediaContent,
  type ScriptureContent,
  type InsertScriptureContent,
  type SadhanaContent,
  type InsertSadhanaContent,
  type AlarmSound,
  type InsertAlarmSound,
  type RegistrationAttempt,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  verifyUserEmail(token: string): Promise<User | undefined>;
  verifyUserCode(email: string, code: string): Promise<User | undefined>;
  updateVerificationCode(email: string, code: string, token: string, expiry: Date): Promise<User | undefined>;
  setResetPasswordCode(email: string, code: string): Promise<User | undefined>;
  resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<User | undefined>;
  
  // Alarm settings
  getAlarmSettings(userId: string): Promise<AlarmSettings | undefined>;
  upsertAlarmSettings(settings: InsertAlarmSettings): Promise<AlarmSettings>;
  
  // Sadhana progress
  getSadhanaProgress(userId: string, date: string): Promise<SadhanaProgress | undefined>;
  getSadhanaProgressByDateRange(userId: string, startDate: string, endDate: string): Promise<SadhanaProgress[]>;
  upsertSadhanaProgress(progress: InsertSadhanaProgress): Promise<SadhanaProgress>;
  getUserStats(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalJapCount: number;
    completedDays: number;
  }>;
  
  // Media categories
  getAllMediaCategories(): Promise<MediaCategory[]>;
  getMediaCategoryById(id: string): Promise<MediaCategory | undefined>;
  getMediaCategoryByName(name: string): Promise<MediaCategory | undefined>;
  createMediaCategory(category: InsertMediaCategory): Promise<MediaCategory>;
  updateMediaCategory(id: string, category: Partial<InsertMediaCategory>): Promise<MediaCategory>;
  deleteMediaCategory(id: string): Promise<void>;
  
  // Media content
  getAllMedia(categoryId?: string): Promise<MediaContent[]>;
  getMediaById(id: string): Promise<MediaContent | undefined>;
  createMedia(media: InsertMediaContent): Promise<MediaContent>;
  updateMedia(id: string, media: Partial<InsertMediaContent>): Promise<MediaContent>;
  deleteMedia(id: string): Promise<void>;
  
  // Scripture content
  getAllScriptures(): Promise<ScriptureContent[]>;
  getScriptureByChapter(chapterNumber: number): Promise<ScriptureContent | undefined>;
  createScripture(scripture: InsertScriptureContent): Promise<ScriptureContent>;
  updateScripture(id: string, scripture: Partial<InsertScriptureContent>): Promise<ScriptureContent>;
  deleteScripture(id: string): Promise<void>;
  
  // Sadhana content
  getAllSadhanaContent(category?: string): Promise<SadhanaContent[]>;
  getSadhanaContentById(id: string): Promise<SadhanaContent | undefined>;
  createSadhanaContent(content: InsertSadhanaContent): Promise<SadhanaContent>;
  updateSadhanaContent(id: string, content: Partial<InsertSadhanaContent>): Promise<SadhanaContent>;
  deleteSadhanaContent(id: string): Promise<void>;
  
  // Alarm sounds
  getAllAlarmSounds(): Promise<AlarmSound[]>;
  getAlarmSoundById(id: string): Promise<AlarmSound | undefined>;
  createAlarmSound(sound: InsertAlarmSound): Promise<AlarmSound>;
  updateAlarmSound(id: string, sound: Partial<InsertAlarmSound>): Promise<AlarmSound>;
  deleteAlarmSound(id: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Rate limiting
  getRecentRegistrationAttempts(email: string, since: Date): Promise<RegistrationAttempt[]>;
  recordRegistrationAttempt(email: string, ipAddress?: string): Promise<RegistrationAttempt>;
  cleanupOldAttempts(before: Date): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
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

  async updateVerificationCode(email: string, code: string, token: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      return undefined;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        verificationCode: code,
        verificationToken: token,
        verificationCodeExpiry: expiry,
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
  async getAlarmSettings(userId: string): Promise<AlarmSettings | undefined> {
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
  async getSadhanaProgress(userId: string, date: string): Promise<SadhanaProgress | undefined> {
    const [progress] = await db
      .select()
      .from(sadhanaProgress)
      .where(and(eq(sadhanaProgress.userId, userId), eq(sadhanaProgress.date, date)));
    return progress;
  }

  async getSadhanaProgressByDateRange(
    userId: string,
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

  async getUserStats(userId: string): Promise<{
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

  // Media categories
  async getAllMediaCategories(): Promise<MediaCategory[]> {
    return await db.select().from(mediaCategories).orderBy(mediaCategories.orderIndex, mediaCategories.displayName);
  }

  async getMediaCategoryById(id: string): Promise<MediaCategory | undefined> {
    const [category] = await db.select().from(mediaCategories).where(eq(mediaCategories.id, id));
    return category;
  }

  async getMediaCategoryByName(name: string): Promise<MediaCategory | undefined> {
    const [category] = await db.select().from(mediaCategories).where(eq(mediaCategories.name, name));
    return category;
  }

  async createMediaCategory(categoryData: InsertMediaCategory): Promise<MediaCategory> {
    const [category] = await db.insert(mediaCategories).values(categoryData).returning();
    return category;
  }

  async updateMediaCategory(id: string, categoryData: Partial<InsertMediaCategory>): Promise<MediaCategory> {
    const [updated] = await db
      .update(mediaCategories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(mediaCategories.id, id))
      .returning();
    return updated;
  }

  async deleteMediaCategory(id: string): Promise<void> {
    await db.delete(mediaCategories).where(eq(mediaCategories.id, id));
  }

  // Media content
  async getAllMedia(categoryId?: string): Promise<MediaContent[]> {
    if (categoryId) {
      return await db
        .select()
        .from(mediaContent)
        .where(eq(mediaContent.categoryId, categoryId))
        .orderBy(desc(mediaContent.createdAt));
    }
    return await db.select().from(mediaContent).orderBy(desc(mediaContent.createdAt));
  }

  async getMediaById(id: string): Promise<MediaContent | undefined> {
    const [media] = await db.select().from(mediaContent).where(eq(mediaContent.id, id));
    return media;
  }

  async createMedia(mediaData: InsertMediaContent): Promise<MediaContent> {
    const [media] = await db.insert(mediaContent).values(mediaData).returning();
    return media;
  }

  async updateMedia(id: string, mediaData: Partial<InsertMediaContent>): Promise<MediaContent> {
    const [updated] = await db
      .update(mediaContent)
      .set({ ...mediaData, updatedAt: new Date() })
      .where(eq(mediaContent.id, id))
      .returning();
    return updated;
  }

  async deleteMedia(id: string): Promise<void> {
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

  async updateScripture(id: string, scriptureData: Partial<InsertScriptureContent>): Promise<ScriptureContent> {
    const [updated] = await db
      .update(scriptureContent)
      .set({ ...scriptureData, updatedAt: new Date() })
      .where(eq(scriptureContent.id, id))
      .returning();
    return updated;
  }

  async deleteScripture(id: string): Promise<void> {
    await db.delete(scriptureContent).where(eq(scriptureContent.id, id));
  }

  // Sadhana content operations
  async getAllSadhanaContent(category?: string): Promise<SadhanaContent[]> {
    if (category) {
      return await db
        .select()
        .from(sadhanaContent)
        .where(eq(sadhanaContent.category, category))
        .orderBy(sadhanaContent.orderNumber);
    }
    return await db
      .select()
      .from(sadhanaContent)
      .orderBy(sadhanaContent.category, sadhanaContent.orderNumber);
  }

  async getSadhanaContentById(id: string): Promise<SadhanaContent | undefined> {
    const [content] = await db
      .select()
      .from(sadhanaContent)
      .where(eq(sadhanaContent.id, id));
    return content;
  }

  async createSadhanaContent(contentData: InsertSadhanaContent): Promise<SadhanaContent> {
    const [content] = await db
      .insert(sadhanaContent)
      .values(contentData)
      .returning();
    return content;
  }

  async updateSadhanaContent(id: string, contentData: Partial<InsertSadhanaContent>): Promise<SadhanaContent> {
    const [updated] = await db
      .update(sadhanaContent)
      .set({ ...contentData, updatedAt: new Date() })
      .where(eq(sadhanaContent.id, id))
      .returning();
    return updated;
  }

  async deleteSadhanaContent(id: string): Promise<void> {
    await db.delete(sadhanaContent).where(eq(sadhanaContent.id, id));
  }

  // Alarm sounds operations
  async getAllAlarmSounds(): Promise<AlarmSound[]> {
    return await db.select().from(alarmSounds).orderBy(desc(alarmSounds.isDefault), alarmSounds.name);
  }

  async getAlarmSoundById(id: string): Promise<AlarmSound | undefined> {
    const [sound] = await db.select().from(alarmSounds).where(eq(alarmSounds.id, id));
    return sound;
  }

  async createAlarmSound(soundData: InsertAlarmSound): Promise<AlarmSound> {
    const [sound] = await db.insert(alarmSounds).values(soundData).returning();
    return sound;
  }

  async updateAlarmSound(id: string, soundData: Partial<InsertAlarmSound>): Promise<AlarmSound> {
    const [updated] = await db
      .update(alarmSounds)
      .set({ ...soundData, updatedAt: new Date() })
      .where(eq(alarmSounds.id, id))
      .returning();
    return updated;
  }

  async deleteAlarmSound(id: string): Promise<void> {
    await db.delete(alarmSounds).where(eq(alarmSounds.id, id));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.emailVerified, true)).orderBy(desc(users.createdAt));
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }
  
  // Rate limiting
  async getRecentRegistrationAttempts(email: string, since: Date): Promise<RegistrationAttempt[]> {
    return await db
      .select()
      .from(registrationAttempts)
      .where(and(
        eq(registrationAttempts.email, email),
        gte(registrationAttempts.attemptedAt, since)
      ))
      .orderBy(desc(registrationAttempts.attemptedAt));
  }

  async recordRegistrationAttempt(email: string, ipAddress?: string): Promise<RegistrationAttempt> {
    const [attempt] = await db
      .insert(registrationAttempts)
      .values({
        email,
        ipAddress: ipAddress || null,
      })
      .returning();
    return attempt;
  }

  async cleanupOldAttempts(before: Date): Promise<void> {
    await db.delete(registrationAttempts).where(
      lte(registrationAttempts.attemptedAt, before)
    );
  }
}

export const storage = new DatabaseStorage();
