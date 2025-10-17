import {
  users,
  alarmSettings,
  sadhanaProgress,
  mediaCategories,
  mediaContent,
  scriptureContent,
  sadhanaContent,
  alarmSounds,
  japaAudios,
  japaSettings,
  registrationAttempts,
  mahapuranTitles,
  mahapuranSkandas,
  mahapuranChapters,
  userMediaFavorites,
  mahapuranPdfs,
  trisandhyaPdfs,
  notificationSounds,
  notifications,
  notificationReceipts,
  notificationPreferences,
  pushSubscriptions,
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
  type JapaAudio,
  type InsertJapaAudio,
  type JapaSettings,
  type InsertJapaSettings,
  type RegistrationAttempt,
  type MahapuranTitle,
  type InsertMahapuranTitle,
  type MahapuranSkanda,
  type InsertMahapuranSkanda,
  type MahapuranChapter,
  type InsertMahapuranChapter,
  type UserMediaFavorite,
  type InsertUserMediaFavorite,
  type MahapuranPdf,
  type InsertMahapuranPdf,
  type TrisandhyaPdf,
  type InsertTrisandhyaPdf,
  type NotificationSound,
  type InsertNotificationSound,
  type Notification,
  type InsertNotification,
  type NotificationReceipt,
  type InsertNotificationReceipt,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type PushSubscription,
  type InsertPushSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, or, isNull, sql } from "drizzle-orm";

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
  
  // Japa audios
  getAllJapaAudios(): Promise<JapaAudio[]>;
  getJapaAudioById(id: string): Promise<JapaAudio | undefined>;
  createJapaAudio(audio: InsertJapaAudio): Promise<JapaAudio>;
  updateJapaAudio(id: string, audio: Partial<InsertJapaAudio>): Promise<JapaAudio>;
  deleteJapaAudio(id: string): Promise<void>;
  
  // Japa settings
  getJapaSettings(userId: string): Promise<JapaSettings | undefined>;
  upsertJapaSettings(settings: InsertJapaSettings): Promise<JapaSettings>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Rate limiting
  getRecentRegistrationAttempts(email: string, since: Date): Promise<RegistrationAttempt[]>;
  recordRegistrationAttempt(email: string, ipAddress?: string): Promise<RegistrationAttempt>;
  cleanupOldAttempts(before: Date): Promise<void>;
  
  // Mahapuran titles
  getAllMahapuranTitles(collectionType?: string): Promise<MahapuranTitle[]>;
  getMahapuranTitleById(id: string): Promise<MahapuranTitle | undefined>;
  createMahapuranTitle(title: InsertMahapuranTitle): Promise<MahapuranTitle>;
  updateMahapuranTitle(id: string, title: Partial<InsertMahapuranTitle>): Promise<MahapuranTitle>;
  deleteMahapuranTitle(id: string): Promise<void>;
  
  // Mahapuran skandas
  getAllMahapuranSkandas(mahapuranTitleId?: string): Promise<MahapuranSkanda[]>;
  getMahapuranSkandaById(id: string): Promise<MahapuranSkanda | undefined>;
  createMahapuranSkanda(skanda: InsertMahapuranSkanda): Promise<MahapuranSkanda>;
  updateMahapuranSkanda(id: string, skanda: Partial<InsertMahapuranSkanda>): Promise<MahapuranSkanda>;
  deleteMahapuranSkanda(id: string): Promise<void>;
  
  // Mahapuran chapters
  getAllMahapuranChapters(skandaId?: string): Promise<MahapuranChapter[]>;
  getMahapuranChapterById(id: string): Promise<MahapuranChapter | undefined>;
  createMahapuranChapter(chapter: InsertMahapuranChapter): Promise<MahapuranChapter>;
  updateMahapuranChapter(id: string, chapter: Partial<InsertMahapuranChapter>): Promise<MahapuranChapter>;
  deleteMahapuranChapter(id: string): Promise<void>;
  
  // Trisandhya PDFs
  getAllTrisandhyaPdfs(): Promise<TrisandhyaPdf[]>;
  getTrisandhyaPdfById(id: string): Promise<TrisandhyaPdf | undefined>;
  createTrisandhyaPdf(pdf: InsertTrisandhyaPdf): Promise<TrisandhyaPdf>;
  updateTrisandhyaPdf(id: string, pdf: Partial<InsertTrisandhyaPdf>): Promise<TrisandhyaPdf>;
  deleteTrisandhyaPdf(id: string): Promise<void>;
  
  // User media favorites
  getUserMediaFavorites(userId: string): Promise<MediaContent[]>;
  addMediaFavorite(favorite: InsertUserMediaFavorite): Promise<UserMediaFavorite>;
  removeMediaFavorite(userId: string, mediaId: string): Promise<void>;
  isMediaFavorited(userId: string, mediaId: string): Promise<boolean>;
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

  // Japa audios operations
  async getAllJapaAudios(): Promise<JapaAudio[]> {
    return await db.select().from(japaAudios).orderBy(desc(japaAudios.isDefault), japaAudios.name);
  }

  async getJapaAudioById(id: string): Promise<JapaAudio | undefined> {
    const [audio] = await db.select().from(japaAudios).where(eq(japaAudios.id, id));
    return audio;
  }

  async createJapaAudio(audioData: InsertJapaAudio): Promise<JapaAudio> {
    const [audio] = await db.insert(japaAudios).values(audioData).returning();
    return audio;
  }

  async updateJapaAudio(id: string, audioData: Partial<InsertJapaAudio>): Promise<JapaAudio> {
    const [updated] = await db
      .update(japaAudios)
      .set({ ...audioData, updatedAt: new Date() })
      .where(eq(japaAudios.id, id))
      .returning();
    return updated;
  }

  async deleteJapaAudio(id: string): Promise<void> {
    await db.delete(japaAudios).where(eq(japaAudios.id, id));
  }

  // Japa settings operations
  async getJapaSettings(userId: string): Promise<JapaSettings | undefined> {
    const [settings] = await db.select().from(japaSettings).where(eq(japaSettings.userId, userId));
    return settings;
  }

  async upsertJapaSettings(settingsData: InsertJapaSettings): Promise<JapaSettings> {
    const [settings] = await db
      .insert(japaSettings)
      .values(settingsData)
      .onConflictDoUpdate({
        target: japaSettings.userId,
        set: {
          ...settingsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
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
  
  // Mahapuran titles operations
  async getAllMahapuranTitles(collectionType?: string): Promise<MahapuranTitle[]> {
    if (collectionType) {
      return await db.select().from(mahapuranTitles)
        .where(eq(mahapuranTitles.collectionType, collectionType))
        .orderBy(mahapuranTitles.orderIndex, mahapuranTitles.title);
    }
    return await db.select().from(mahapuranTitles).orderBy(mahapuranTitles.orderIndex, mahapuranTitles.title);
  }

  async getMahapuranTitleById(id: string): Promise<MahapuranTitle | undefined> {
    const [title] = await db.select().from(mahapuranTitles).where(eq(mahapuranTitles.id, id));
    return title;
  }

  async createMahapuranTitle(titleData: InsertMahapuranTitle): Promise<MahapuranTitle> {
    const [title] = await db.insert(mahapuranTitles).values(titleData).returning();
    return title;
  }

  async updateMahapuranTitle(id: string, titleData: Partial<InsertMahapuranTitle>): Promise<MahapuranTitle> {
    const [updated] = await db
      .update(mahapuranTitles)
      .set({ ...titleData, updatedAt: new Date() })
      .where(eq(mahapuranTitles.id, id))
      .returning();
    return updated;
  }

  async deleteMahapuranTitle(id: string): Promise<void> {
    await db.delete(mahapuranTitles).where(eq(mahapuranTitles.id, id));
  }

  // Mahapuran skandas operations
  async getAllMahapuranSkandas(mahapuranTitleId?: string): Promise<MahapuranSkanda[]> {
    if (mahapuranTitleId) {
      return await db.select().from(mahapuranSkandas).where(eq(mahapuranSkandas.mahapuranTitleId, mahapuranTitleId)).orderBy(mahapuranSkandas.skandaNumber);
    }
    return await db.select().from(mahapuranSkandas).orderBy(mahapuranSkandas.mahapuranTitleId, mahapuranSkandas.skandaNumber);
  }

  async getMahapuranSkandaById(id: string): Promise<MahapuranSkanda | undefined> {
    const [skanda] = await db.select().from(mahapuranSkandas).where(eq(mahapuranSkandas.id, id));
    return skanda;
  }

  async createMahapuranSkanda(skandaData: InsertMahapuranSkanda): Promise<MahapuranSkanda> {
    const [skanda] = await db.insert(mahapuranSkandas).values(skandaData).returning();
    return skanda;
  }

  async updateMahapuranSkanda(id: string, skandaData: Partial<InsertMahapuranSkanda>): Promise<MahapuranSkanda> {
    const [updated] = await db
      .update(mahapuranSkandas)
      .set({ ...skandaData, updatedAt: new Date() })
      .where(eq(mahapuranSkandas.id, id))
      .returning();
    return updated;
  }

  async deleteMahapuranSkanda(id: string): Promise<void> {
    await db.delete(mahapuranSkandas).where(eq(mahapuranSkandas.id, id));
  }

  // Mahapuran chapters operations
  async getAllMahapuranChapters(skandaId?: string): Promise<MahapuranChapter[]> {
    if (skandaId) {
      return await db.select().from(mahapuranChapters).where(eq(mahapuranChapters.skandaId, skandaId)).orderBy(mahapuranChapters.chapterNumber);
    }
    return await db.select().from(mahapuranChapters).orderBy(mahapuranChapters.skandaId, mahapuranChapters.chapterNumber);
  }

  async getMahapuranChapterById(id: string): Promise<MahapuranChapter | undefined> {
    const [chapter] = await db.select().from(mahapuranChapters).where(eq(mahapuranChapters.id, id));
    return chapter;
  }

  async createMahapuranChapter(chapterData: InsertMahapuranChapter): Promise<MahapuranChapter> {
    const [chapter] = await db.insert(mahapuranChapters).values(chapterData).returning();
    return chapter;
  }

  async updateMahapuranChapter(id: string, chapterData: Partial<InsertMahapuranChapter>): Promise<MahapuranChapter> {
    const [updated] = await db
      .update(mahapuranChapters)
      .set({ ...chapterData, updatedAt: new Date() })
      .where(eq(mahapuranChapters.id, id))
      .returning();
    return updated;
  }

  async deleteMahapuranChapter(id: string): Promise<void> {
    await db.delete(mahapuranChapters).where(eq(mahapuranChapters.id, id));
  }

  // User media favorites operations
  async getUserMediaFavorites(userId: string): Promise<MediaContent[]> {
    const favorites = await db
      .select({
        media: mediaContent,
      })
      .from(userMediaFavorites)
      .innerJoin(mediaContent, eq(userMediaFavorites.mediaId, mediaContent.id))
      .where(eq(userMediaFavorites.userId, userId))
      .orderBy(desc(userMediaFavorites.createdAt));
    
    return favorites.map(f => f.media);
  }

  async addMediaFavorite(favoriteData: InsertUserMediaFavorite): Promise<UserMediaFavorite> {
    const [favorite] = await db.insert(userMediaFavorites).values(favoriteData).returning();
    return favorite;
  }

  async removeMediaFavorite(userId: string, mediaId: string): Promise<void> {
    await db.delete(userMediaFavorites).where(
      and(
        eq(userMediaFavorites.userId, userId),
        eq(userMediaFavorites.mediaId, mediaId)
      )
    );
  }

  async isMediaFavorited(userId: string, mediaId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userMediaFavorites)
      .where(
        and(
          eq(userMediaFavorites.userId, userId),
          eq(userMediaFavorites.mediaId, mediaId)
        )
      );
    return !!favorite;
  }

  // Mahapuran PDFs operations
  async getAllMahapuranPdfs(): Promise<MahapuranPdf[]> {
    return await db.select().from(mahapuranPdfs).where(eq(mahapuranPdfs.isActive, true)).orderBy(mahapuranPdfs.orderIndex, mahapuranPdfs.languageName);
  }

  async getMahapuranPdfById(id: string): Promise<MahapuranPdf | undefined> {
    const [pdf] = await db.select().from(mahapuranPdfs).where(eq(mahapuranPdfs.id, id));
    return pdf;
  }

  async getMahapuranPdfByLanguage(languageCode: string): Promise<MahapuranPdf | undefined> {
    const [pdf] = await db.select().from(mahapuranPdfs).where(eq(mahapuranPdfs.languageCode, languageCode));
    return pdf;
  }

  async createMahapuranPdf(pdfData: InsertMahapuranPdf): Promise<MahapuranPdf> {
    const [pdf] = await db.insert(mahapuranPdfs).values(pdfData).returning();
    return pdf;
  }

  async updateMahapuranPdf(id: string, pdfData: Partial<InsertMahapuranPdf>): Promise<MahapuranPdf> {
    const [updated] = await db
      .update(mahapuranPdfs)
      .set({ ...pdfData, updatedAt: new Date() })
      .where(eq(mahapuranPdfs.id, id))
      .returning();
    return updated;
  }

  async deleteMahapuranPdf(id: string): Promise<void> {
    await db.delete(mahapuranPdfs).where(eq(mahapuranPdfs.id, id));
  }

  // Trisandhya PDFs operations
  async getAllTrisandhyaPdfs(): Promise<TrisandhyaPdf[]> {
    return await db.select().from(trisandhyaPdfs).where(eq(trisandhyaPdfs.isActive, true)).orderBy(trisandhyaPdfs.orderIndex, trisandhyaPdfs.languageName);
  }

  async getTrisandhyaPdfById(id: string): Promise<TrisandhyaPdf | undefined> {
    const [pdf] = await db.select().from(trisandhyaPdfs).where(eq(trisandhyaPdfs.id, id));
    return pdf;
  }

  async createTrisandhyaPdf(pdfData: InsertTrisandhyaPdf): Promise<TrisandhyaPdf> {
    const [pdf] = await db.insert(trisandhyaPdfs).values(pdfData).returning();
    return pdf;
  }

  async updateTrisandhyaPdf(id: string, pdfData: Partial<InsertTrisandhyaPdf>): Promise<TrisandhyaPdf> {
    const [updated] = await db
      .update(trisandhyaPdfs)
      .set({ ...pdfData, updatedAt: new Date() })
      .where(eq(trisandhyaPdfs.id, id))
      .returning();
    return updated;
  }

  async deleteTrisandhyaPdf(id: string): Promise<void> {
    await db.delete(trisandhyaPdfs).where(eq(trisandhyaPdfs.id, id));
  }

  // Notification sounds operations
  async getAllNotificationSounds(): Promise<NotificationSound[]> {
    return await db.select().from(notificationSounds).orderBy(notificationSounds.name);
  }

  async getNotificationSoundById(id: string): Promise<NotificationSound | undefined> {
    const [sound] = await db.select().from(notificationSounds).where(eq(notificationSounds.id, id));
    return sound;
  }

  async createNotificationSound(soundData: InsertNotificationSound): Promise<NotificationSound> {
    const [sound] = await db.insert(notificationSounds).values(soundData).returning();
    return sound;
  }

  async updateNotificationSound(id: string, soundData: Partial<InsertNotificationSound>): Promise<NotificationSound> {
    const [updated] = await db
      .update(notificationSounds)
      .set({ ...soundData, updatedAt: new Date() })
      .where(eq(notificationSounds.id, id))
      .returning();
    return updated;
  }

  async deleteNotificationSound(id: string): Promise<void> {
    await db.delete(notificationSounds).where(eq(notificationSounds.id, id));
  }

  // Notifications operations
  async getAllNotifications(limit?: number): Promise<Notification[]> {
    const query = db.select().from(notifications).orderBy(desc(notifications.createdAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getNotificationById(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getActiveNotifications(): Promise<Notification[]> {
    const now = new Date();
    return await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.sendToAll, true),
          or(
            isNull(notifications.expiresAt),
            sql`${notifications.expiresAt} > ${now}`
          )
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async updateNotification(id: string, notificationData: Partial<InsertNotification>): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set(notificationData)
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Notification receipts operations
  async getUserNotifications(userId: string, limit?: number): Promise<any[]> {
    const query = db
      .select({
        notification: notifications,
        receipt: notificationReceipts,
      })
      .from(notificationReceipts)
      .innerJoin(notifications, eq(notificationReceipts.notificationId, notifications.id))
      .where(eq(notificationReceipts.userId, userId))
      .orderBy(desc(notificationReceipts.deliveredAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationReceipts)
      .where(
        and(
          eq(notificationReceipts.userId, userId),
          eq(notificationReceipts.isRead, false)
        )
      );
    return Number(result[0]?.count || 0);
  }

  async createNotificationReceipt(receiptData: InsertNotificationReceipt): Promise<NotificationReceipt> {
    const [receipt] = await db.insert(notificationReceipts).values(receiptData).returning();
    return receipt;
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    await db
      .update(notificationReceipts)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notificationReceipts.userId, userId),
          eq(notificationReceipts.notificationId, notificationId)
        )
      );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notificationReceipts)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notificationReceipts.userId, userId));
  }

  // Notification preferences operations
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async createNotificationPreferences(prefsData: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [prefs] = await db.insert(notificationPreferences).values(prefsData).returning();
    return prefs;
  }

  async updateNotificationPreferences(userId: string, prefsData: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    const [updated] = await db
      .update(notificationPreferences)
      .set({ ...prefsData, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return updated;
  }

  // Push subscriptions operations
  async getPushSubscription(userId: string, endpoint: string): Promise<PushSubscription | undefined> {
    const [sub] = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      );
    return sub;
  }

  async getAllPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }

  async createPushSubscription(subData: InsertPushSubscription): Promise<PushSubscription> {
    const [sub] = await db.insert(pushSubscriptions).values(subData).returning();
    return sub;
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async updatePushSubscriptionLastUsed(endpoint: string): Promise<void> {
    await db
      .update(pushSubscriptions)
      .set({ lastUsedAt: new Date() })
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }
}

export const storage = new DatabaseStorage();
