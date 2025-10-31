var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alarmSettings: () => alarmSettings,
  alarmSounds: () => alarmSounds,
  customAlarmTones: () => customAlarmTones,
  forgotPasswordSchema: () => forgotPasswordSchema,
  insertAlarmSettingsSchema: () => insertAlarmSettingsSchema,
  insertAlarmSoundSchema: () => insertAlarmSoundSchema,
  insertCustomAlarmToneSchema: () => insertCustomAlarmToneSchema,
  insertJapaAudioSchema: () => insertJapaAudioSchema,
  insertJapaSettingsSchema: () => insertJapaSettingsSchema,
  insertMahapuranChapterSchema: () => insertMahapuranChapterSchema,
  insertMahapuranPdfSchema: () => insertMahapuranPdfSchema,
  insertMahapuranSkandaSchema: () => insertMahapuranSkandaSchema,
  insertMahapuranTitleSchema: () => insertMahapuranTitleSchema,
  insertMediaCategorySchema: () => insertMediaCategorySchema,
  insertMediaContentSchema: () => insertMediaContentSchema,
  insertMobileAlarmSchema: () => insertMobileAlarmSchema,
  insertNotificationPreferencesSchema: () => insertNotificationPreferencesSchema,
  insertNotificationReceiptSchema: () => insertNotificationReceiptSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertNotificationSoundSchema: () => insertNotificationSoundSchema,
  insertPushSubscriptionSchema: () => insertPushSubscriptionSchema,
  insertSadhanaContentSchema: () => insertSadhanaContentSchema,
  insertSadhanaProgressSchema: () => insertSadhanaProgressSchema,
  insertScriptureContentSchema: () => insertScriptureContentSchema,
  insertScripturePdfSchema: () => insertScripturePdfSchema,
  insertTrisandhyaPdfSchema: () => insertTrisandhyaPdfSchema,
  insertUserMediaFavoriteSchema: () => insertUserMediaFavoriteSchema,
  insertWebAlarmInstanceSchema: () => insertWebAlarmInstanceSchema,
  insertWebAlarmSchema: () => insertWebAlarmSchema,
  japaAudios: () => japaAudios,
  japaSettings: () => japaSettings,
  loginUserSchema: () => loginUserSchema,
  mahapuranChapters: () => mahapuranChapters,
  mahapuranPdfs: () => mahapuranPdfs,
  mahapuranSkandas: () => mahapuranSkandas,
  mahapuranTitles: () => mahapuranTitles,
  mediaCategories: () => mediaCategories,
  mediaContent: () => mediaContent,
  mobileAlarms: () => mobileAlarms,
  notificationPreferences: () => notificationPreferences,
  notificationReceipts: () => notificationReceipts,
  notificationSounds: () => notificationSounds,
  notifications: () => notifications,
  pushSubscriptions: () => pushSubscriptions,
  registerUserSchema: () => registerUserSchema,
  registrationAttempts: () => registrationAttempts,
  resetPasswordSchema: () => resetPasswordSchema,
  sadhanaContent: () => sadhanaContent,
  sadhanaProgress: () => sadhanaProgress,
  scriptureContent: () => scriptureContent,
  scripturePdfs: () => scripturePdfs,
  sessions: () => sessions,
  trisandhyaPdfs: () => trisandhyaPdfs,
  userMediaFavorites: () => userMediaFavorites,
  users: () => users,
  verifyCodeSchema: () => verifyCodeSchema,
  webAlarmInstances: () => webAlarmInstances,
  webAlarms: () => webAlarms
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, users, registerUserSchema, loginUserSchema, verifyCodeSchema, forgotPasswordSchema, resetPasswordSchema, alarmSettings, insertAlarmSettingsSchema, sadhanaProgress, insertSadhanaProgressSchema, mediaCategories, insertMediaCategorySchema, mediaContent, insertMediaContentSchema, scriptureContent, insertScriptureContentSchema, mahapuranTitles, insertMahapuranTitleSchema, mahapuranSkandas, insertMahapuranSkandaSchema, mahapuranChapters, insertMahapuranChapterSchema, userMediaFavorites, insertUserMediaFavoriteSchema, sadhanaContent, insertSadhanaContentSchema, alarmSounds, insertAlarmSoundSchema, japaAudios, insertJapaAudioSchema, japaSettings, insertJapaSettingsSchema, registrationAttempts, mahapuranPdfs, insertMahapuranPdfSchema, trisandhyaPdfs, insertTrisandhyaPdfSchema, scripturePdfs, insertScripturePdfSchema, notificationSounds, insertNotificationSoundSchema, notifications, insertNotificationSchema, notificationReceipts, insertNotificationReceiptSchema, notificationPreferences, insertNotificationPreferencesSchema, pushSubscriptions, insertPushSubscriptionSchema, mobileAlarms, insertMobileAlarmSchema, webAlarms, insertWebAlarmSchema, webAlarmInstances, insertWebAlarmInstanceSchema, customAlarmTones, insertCustomAlarmToneSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: varchar("email").unique(),
      password: varchar("hashed_password"),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("avatar_url"),
      isAdmin: boolean("is_admin").default(false).notNull(),
      emailVerified: boolean("email_verified").default(false).notNull(),
      verificationToken: varchar("verification_token"),
      verificationCode: varchar("verification_code", { length: 6 }),
      verificationCodeExpiry: timestamp("verification_code_expiry"),
      resetPasswordCode: varchar("reset_password_code", { length: 6 }),
      resetPasswordCodeExpiry: timestamp("reset_password_code_expiry"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      googleId: text("google_id"),
      username: varchar("username"),
      role: varchar("role"),
      lastLogin: timestamp("last_login")
    });
    registerUserSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required")
    });
    loginUserSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(1, "Password is required")
    });
    verifyCodeSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      code: z.string().length(6, "Verification code must be 6 digits")
    });
    forgotPasswordSchema = z.object({
      email: z.string().email("Please enter a valid email address")
    });
    resetPasswordSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      code: z.string().length(6, "Reset code must be 6 digits"),
      password: z.string().min(6, "Password must be at least 6 characters")
    });
    alarmSettings = pgTable("alarm_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      pratahEnabled: boolean("pratah_enabled").default(true).notNull(),
      pratahTime: varchar("pratah_time", { length: 5 }).default("05:30").notNull(),
      // HH:MM format
      madhyahnaEnabled: boolean("madhyahna_enabled").default(true).notNull(),
      madhyahnaTime: varchar("madhyahna_time", { length: 5 }).default("12:00").notNull(),
      // HH:MM format
      sayamEnabled: boolean("sayam_enabled").default(true).notNull(),
      sayamTime: varchar("sayam_time", { length: 5 }).default("18:00").notNull(),
      // HH:MM format
      alarmSoundId: varchar("alarm_sound_id").references(() => alarmSounds.id),
      volume: integer("volume").default(80).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertAlarmSettingsSchema = createInsertSchema(alarmSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    sadhanaProgress = pgTable("sadhana_progress", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      date: date("date").notNull(),
      pratahCompleted: boolean("pratah_completed").default(false).notNull(),
      madhyahnaCompleted: boolean("madhyahna_completed").default(false).notNull(),
      sayamCompleted: boolean("sayam_completed").default(false).notNull(),
      mahapuranCompleted: boolean("mahapuran_completed").default(false).notNull(),
      japCompleted: boolean("jap_completed").default(false).notNull(),
      japCount: integer("jap_count").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertSadhanaProgressSchema = createInsertSchema(sadhanaProgress).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    mediaCategories = pgTable("media_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 100 }).notNull().unique(),
      displayName: varchar("display_name", { length: 100 }).notNull(),
      description: text("description"),
      orderIndex: integer("order_index").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMediaCategorySchema = createInsertSchema(mediaCategories).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    mediaContent = pgTable("media_content", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title", { length: 255 }).notNull(),
      categoryId: varchar("category_id").references(() => mediaCategories.id, { onDelete: "cascade" }),
      type: varchar("type", { length: 20 }).notNull(),
      // 'audio', 'video', 'youtube'
      artist: varchar("artist", { length: 255 }),
      url: text("url").notNull(),
      thumbnailUrl: text("thumbnail_url"),
      duration: varchar("duration", { length: 20 }),
      description: text("description"),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type", { length: 100 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMediaContentSchema = createInsertSchema(mediaContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    scriptureContent = pgTable("scripture_content", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      chapterNumber: integer("chapter_number").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      summary: text("summary"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertScriptureContentSchema = createInsertSchema(scriptureContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    mahapuranTitles = pgTable("mahapuran_titles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title", { length: 255 }).notNull(),
      language: varchar("language", { length: 10 }).notNull(),
      // 'en', 'hin', etc.
      languageName: varchar("language_name", { length: 100 }),
      // 'English', 'Hindi', etc.
      description: text("description"),
      collectionType: varchar("collection_type", { length: 20 }).default("mahapuran").notNull(),
      // 'mahapuran' | 'other'
      totalSkandas: integer("total_skandas").default(12).notNull(),
      totalChapters: integer("total_chapters"),
      orderIndex: integer("order_index").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMahapuranTitleSchema = createInsertSchema(mahapuranTitles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    mahapuranSkandas = pgTable("mahapuran_skandas", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      mahapuranTitleId: varchar("mahapuran_title_id").references(() => mahapuranTitles.id, { onDelete: "cascade" }).notNull(),
      skandaNumber: integer("skanda_number").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMahapuranSkandaSchema = createInsertSchema(mahapuranSkandas).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    mahapuranChapters = pgTable("mahapuran_chapters", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      skandaId: varchar("skanda_id").references(() => mahapuranSkandas.id, { onDelete: "cascade" }).notNull(),
      chapterNumber: integer("chapter_number").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      summary: text("summary"),
      fileUrl: varchar("file_url", { length: 500 }),
      fileType: varchar("file_type", { length: 50 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMahapuranChapterSchema = createInsertSchema(mahapuranChapters).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    userMediaFavorites = pgTable("user_media_favorites", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      mediaId: varchar("media_id").references(() => mediaContent.id, { onDelete: "cascade" }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserMediaFavoriteSchema = createInsertSchema(userMediaFavorites).omit({
      id: true,
      createdAt: true
    });
    sadhanaContent = pgTable("sadhana_content", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      category: varchar("category", { length: 50 }).notNull(),
      // 'trisandhya', 'mahapuran', 'jap', 'timing'
      sectionTitle: varchar("section_title", { length: 255 }).notNull(),
      orderNumber: integer("order_number").notNull(),
      sanskritText: text("sanskrit_text"),
      englishTranslation: text("english_translation"),
      description: text("description"),
      repeatCount: varchar("repeat_count", { length: 50 }),
      // e.g., "3 times", "7 times"
      contentType: varchar("content_type", { length: 50 }),
      // 'mantra', 'stotram', 'prayer', 'instruction', 'timing'
      additionalNotes: text("additional_notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertSadhanaContentSchema = createInsertSchema(sadhanaContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    alarmSounds = pgTable("alarm_sounds", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 255 }).notNull(),
      url: text("url").notNull(),
      duration: integer("duration"),
      description: text("description"),
      isDefault: boolean("is_default").default(false).notNull(),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type", { length: 100 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertAlarmSoundSchema = createInsertSchema(alarmSounds).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    japaAudios = pgTable("japa_audios", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 255 }).notNull(),
      url: text("url").notNull(),
      duration: integer("duration"),
      description: text("description"),
      isDefault: boolean("is_default").default(false).notNull(),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type", { length: 100 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertJapaAudioSchema = createInsertSchema(japaAudios).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    japaSettings = pgTable("japa_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
      japaAudioId: varchar("japa_audio_id").references(() => japaAudios.id),
      hapticEnabled: boolean("haptic_enabled").default(false).notNull(),
      soundEnabled: boolean("sound_enabled").default(true).notNull(),
      dailyGoal: integer("daily_goal").default(108).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertJapaSettingsSchema = createInsertSchema(japaSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    registrationAttempts = pgTable("registration_attempts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: varchar("email", { length: 255 }).notNull(),
      attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
      ipAddress: varchar("ip_address", { length: 45 })
    });
    mahapuranPdfs = pgTable("mahapuran_pdfs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      languageCode: varchar("language_code", { length: 10 }).notNull(),
      // 'en', 'hin', 'ben', etc.
      languageName: varchar("language_name", { length: 100 }).notNull(),
      // 'English', 'Hindi', 'Bengali'
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      heroImageUrl: text("hero_image_url"),
      pdfUrl: text("pdf_url"),
      // S3 URL for the PDF
      pdfKey: varchar("pdf_key", { length: 500 }),
      // S3 key for deletion
      fileSize: integer("file_size"),
      // in bytes
      totalSkandas: integer("total_skandas").default(12).notNull(),
      totalChapters: integer("total_chapters"),
      orderIndex: integer("order_index").default(0).notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMahapuranPdfSchema = createInsertSchema(mahapuranPdfs).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    trisandhyaPdfs = pgTable("trisandhya_pdfs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      languageCode: varchar("language_code", { length: 10 }).notNull(),
      // 'en', 'hin', 'ori', etc.
      languageName: varchar("language_name", { length: 100 }).notNull(),
      // 'English', 'Hindi', 'Odia'
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      pdfUrl: text("pdf_url"),
      // S3 URL for the PDF
      pdfKey: varchar("pdf_key", { length: 500 }),
      // S3 key for deletion
      fileSize: integer("file_size"),
      // in bytes
      orderIndex: integer("order_index").default(0).notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertTrisandhyaPdfSchema = createInsertSchema(trisandhyaPdfs).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    scripturePdfs = pgTable("scripture_pdfs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      languageCode: varchar("language_code", { length: 10 }).notNull(),
      // 'en', 'hin', 'san', etc.
      languageName: varchar("language_name", { length: 100 }).notNull(),
      // 'English', 'Hindi', 'Sanskrit'
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      pdfUrl: text("pdf_url"),
      // S3 URL for the PDF
      pdfKey: varchar("pdf_key", { length: 500 }),
      // S3 key for deletion
      fileSize: integer("file_size"),
      // in bytes
      totalSkandas: integer("total_skandas"),
      // Total books/sections
      totalChapters: integer("total_chapters"),
      // Total chapters
      orderIndex: integer("order_index").default(0).notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertScripturePdfSchema = createInsertSchema(scripturePdfs).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    notificationSounds = pgTable("notification_sounds", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name", { length: 255 }).notNull(),
      url: text("url").notNull(),
      duration: integer("duration"),
      description: text("description"),
      isDefault: boolean("is_default").default(false).notNull(),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type", { length: 100 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertNotificationSoundSchema = createInsertSchema(notificationSounds).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    notifications = pgTable("notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title", { length: 255 }).notNull(),
      message: text("message").notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // 'content_update', 'announcement', 'feature', 'media_added', etc.
      category: varchar("category", { length: 100 }),
      // 'media', 'scripture', 'sadhana', 'general'
      targetUrl: varchar("target_url", { length: 500 }),
      // URL to navigate when notification is clicked
      imageUrl: text("image_url"),
      // Optional image for rich notifications
      soundId: varchar("sound_id").references(() => notificationSounds.id),
      priority: varchar("priority", { length: 20 }).default("normal").notNull(),
      // 'low', 'normal', 'high'
      sendToAll: boolean("send_to_all").default(false).notNull(),
      // If true, send to all users
      scheduledFor: timestamp("scheduled_for"),
      // For scheduled notifications
      sentAt: timestamp("sent_at"),
      createdBy: varchar("created_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      expiresAt: timestamp("expires_at")
      // When notification should no longer be shown
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true,
      sentAt: true
    });
    notificationReceipts = pgTable("notification_receipts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      notificationId: varchar("notification_id").references(() => notifications.id, { onDelete: "cascade" }).notNull(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      isRead: boolean("is_read").default(false).notNull(),
      readAt: timestamp("read_at"),
      deliveredAt: timestamp("delivered_at").defaultNow(),
      clicked: boolean("clicked").default(false).notNull(),
      clickedAt: timestamp("clicked_at")
    });
    insertNotificationReceiptSchema = createInsertSchema(notificationReceipts).omit({
      id: true,
      deliveredAt: true
    });
    notificationPreferences = pgTable("notification_preferences", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
      inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
      pushEnabled: boolean("push_enabled").default(true).notNull(),
      emailEnabled: boolean("email_enabled").default(false).notNull(),
      contentUpdates: boolean("content_updates").default(true).notNull(),
      announcements: boolean("announcements").default(true).notNull(),
      mediaAdditions: boolean("media_additions").default(true).notNull(),
      scriptureUpdates: boolean("scripture_updates").default(true).notNull(),
      soundEnabled: boolean("sound_enabled").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    pushSubscriptions = pgTable("push_subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      endpoint: text("endpoint").notNull().unique(),
      keys: jsonb("keys").notNull(),
      // Contains p256dh and auth keys
      userAgent: varchar("user_agent", { length: 500 }),
      createdAt: timestamp("created_at").defaultNow(),
      lastUsedAt: timestamp("last_used_at").defaultNow()
    });
    insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
      id: true,
      createdAt: true,
      lastUsedAt: true
    });
    mobileAlarms = pgTable("mobile_alarms", {
      id: varchar("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      label: varchar("label", { length: 255 }).notNull(),
      time: varchar("time", { length: 5 }).notNull(),
      // HH:MM format
      enabled: boolean("enabled").default(true).notNull(),
      repeatDays: text("repeat_days").notNull(),
      // JSON array
      toneName: varchar("tone_name", { length: 255 }).notNull(),
      toneUri: text("tone_uri"),
      volume: integer("volume").default(80).notNull(),
      vibrate: boolean("vibrate").default(true).notNull(),
      snoozeMinutes: integer("snooze_minutes").default(5).notNull(),
      lastSyncedAt: timestamp("last_synced_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMobileAlarmSchema = createInsertSchema(mobileAlarms).omit({
      createdAt: true,
      lastSyncedAt: true
    });
    webAlarms = pgTable("web_alarms", {
      id: varchar("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      label: varchar("label", { length: 255 }).notNull(),
      time: varchar("time", { length: 5 }).notNull(),
      // HH:MM format
      enabled: boolean("enabled").default(true).notNull(),
      repeatDays: text("repeat_days").notNull(),
      // JSON array of numbers [0-6]
      toneId: varchar("tone_id"),
      toneName: varchar("tone_name", { length: 255 }).notNull(),
      volume: integer("volume").default(80).notNull(),
      vibrate: boolean("vibrate").default(true).notNull(),
      snoozeMinutes: integer("snooze_minutes").default(5).notNull(),
      lastSyncedAt: timestamp("last_synced_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertWebAlarmSchema = createInsertSchema(webAlarms).omit({
      createdAt: true,
      lastSyncedAt: true
    });
    webAlarmInstances = pgTable("web_alarm_instances", {
      id: varchar("id").primaryKey(),
      alarmId: varchar("alarm_id").references(() => webAlarms.id, { onDelete: "cascade" }).notNull(),
      scheduledTime: timestamp("scheduled_time").notNull(),
      triggered: boolean("triggered").default(false).notNull(),
      snoozed: boolean("snoozed").default(false).notNull(),
      dismissed: boolean("dismissed").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertWebAlarmInstanceSchema = createInsertSchema(webAlarmInstances).omit({
      createdAt: true
    });
    customAlarmTones = pgTable("custom_alarm_tones", {
      id: varchar("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 255 }).notNull(),
      dataUrl: text("data_url"),
      s3Key: varchar("s3_key", { length: 500 }),
      duration: integer("duration"),
      fileSize: integer("file_size").notNull(),
      mimeType: varchar("mime_type", { length: 100 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCustomAlarmToneSchema = createInsertSchema(customAlarmTones).omit({
      createdAt: true
    });
  }
});

// server/s3-upload.ts
var s3_upload_exports = {};
__export(s3_upload_exports, {
  deleteFromS3: () => deleteFromS3,
  extractS3Key: () => extractS3Key,
  getS3SignedUrl: () => getS3SignedUrl,
  getUploadToS3: () => getUploadToS3,
  uploadToS3: () => uploadToS3
});
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
function getS3Client() {
  if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    throw new Error("S3 credentials not configured. Please set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables.");
  }
  return new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  });
}
function getBucketName() {
  if (!process.env.S3_BUCKET_NAME) {
    throw new Error("S3 bucket not configured. Please set S3_BUCKET_NAME environment variable.");
  }
  return process.env.S3_BUCKET_NAME;
}
function getUploadToS3() {
  if (!uploadToS3Instance) {
    const s3Client = getS3Client();
    const bucketName = getBucketName();
    uploadToS3Instance = multer({
      storage: multerS3({
        s3: s3Client,
        bucket: bucketName,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          const folder = req.uploadFolder || "uploads";
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const basename = path.basename(file.originalname, ext);
          cb(null, `${folder}/${basename}-${uniqueSuffix}${ext}`);
        }
      }),
      limits: {
        fileSize: 50 * 1024 * 1024
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac",
          "video/mp4",
          "video/webm",
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(", ")}`));
        }
      }
    });
  }
  return uploadToS3Instance;
}
async function deleteFromS3(fileKey) {
  const s3Client = getS3Client();
  const bucketName = getBucketName();
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey
  });
  await s3Client.send(command);
}
async function getS3SignedUrl(fileKey, expiresIn = 3600) {
  const s3Client = getS3Client();
  const bucketName = getBucketName();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
}
function extractS3Key(url) {
  const match = url.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : null;
}
var uploadToS3Instance, uploadToS3;
var init_s3_upload = __esm({
  "server/s3-upload.ts"() {
    "use strict";
    uploadToS3Instance = null;
    uploadToS3 = new Proxy({}, {
      get(_target, prop) {
        return getUploadToS3()[prop];
      }
    });
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();

// server/db.ts
init_schema();
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, gte, lte, or, isNull, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async createLocalUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async verifyUserEmail(token) {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    if (!user) {
      return void 0;
    }
    const [updatedUser] = await db.update(users).set({
      emailVerified: true,
      verificationToken: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, user.id)).returning();
    return updatedUser;
  }
  async verifyUserCode(email, code) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return void 0;
    }
    if (user.verificationCode !== code) {
      return void 0;
    }
    if (/* @__PURE__ */ new Date() > user.verificationCodeExpiry) {
      return void 0;
    }
    const [updatedUser] = await db.update(users).set({
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpiry: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, user.id)).returning();
    return updatedUser;
  }
  async updateVerificationCode(email, code, token, expiry) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return void 0;
    }
    const [updatedUser] = await db.update(users).set({
      verificationCode: code,
      verificationToken: token,
      verificationCodeExpiry: expiry,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, user.id)).returning();
    return updatedUser;
  }
  async setResetPasswordCode(email, code) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return void 0;
    }
    const expiry = /* @__PURE__ */ new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    const [updatedUser] = await db.update(users).set({
      resetPasswordCode: code,
      resetPasswordCodeExpiry: expiry,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, user.id)).returning();
    return updatedUser;
  }
  async resetPasswordWithCode(email, code, newPassword) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.resetPasswordCode || !user.resetPasswordCodeExpiry) {
      return void 0;
    }
    if (user.resetPasswordCode !== code) {
      return void 0;
    }
    if (/* @__PURE__ */ new Date() > user.resetPasswordCodeExpiry) {
      return void 0;
    }
    const [updatedUser] = await db.update(users).set({
      password: newPassword,
      resetPasswordCode: null,
      resetPasswordCodeExpiry: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, user.id)).returning();
    return updatedUser;
  }
  // Alarm settings
  async getAlarmSettings(userId) {
    const [settings] = await db.select().from(alarmSettings).where(eq(alarmSettings.userId, userId));
    return settings;
  }
  async upsertAlarmSettings(settingsData) {
    const existing = await this.getAlarmSettings(settingsData.userId);
    if (existing) {
      const [updated] = await db.update(alarmSettings).set({ ...settingsData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(alarmSettings.userId, settingsData.userId)).returning();
      return updated;
    } else {
      const [created] = await db.insert(alarmSettings).values(settingsData).returning();
      return created;
    }
  }
  // Sadhana progress
  async getSadhanaProgress(userId, date2) {
    const [progress] = await db.select().from(sadhanaProgress).where(and(eq(sadhanaProgress.userId, userId), eq(sadhanaProgress.date, date2)));
    return progress;
  }
  async getSadhanaProgressByDateRange(userId, startDate, endDate) {
    return await db.select().from(sadhanaProgress).where(eq(sadhanaProgress.userId, userId)).orderBy(desc(sadhanaProgress.date));
  }
  async upsertSadhanaProgress(progressData) {
    const existing = await this.getSadhanaProgress(progressData.userId, progressData.date);
    if (existing) {
      const [updated] = await db.update(sadhanaProgress).set({ ...progressData, updatedAt: /* @__PURE__ */ new Date() }).where(and(
        eq(sadhanaProgress.userId, progressData.userId),
        eq(sadhanaProgress.date, progressData.date)
      )).returning();
      return updated;
    } else {
      const [created] = await db.insert(sadhanaProgress).values(progressData).returning();
      return created;
    }
  }
  async getUserStats(userId) {
    const allProgress = await db.select().from(sadhanaProgress).where(eq(sadhanaProgress.userId, userId)).orderBy(desc(sadhanaProgress.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalJapCount = 0;
    let completedDays = 0;
    const today = /* @__PURE__ */ new Date();
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
  async getAllMediaCategories() {
    return await db.select().from(mediaCategories).orderBy(mediaCategories.orderIndex, mediaCategories.displayName);
  }
  async getMediaCategoryById(id) {
    const [category] = await db.select().from(mediaCategories).where(eq(mediaCategories.id, id));
    return category;
  }
  async getMediaCategoryByName(name) {
    const [category] = await db.select().from(mediaCategories).where(eq(mediaCategories.name, name));
    return category;
  }
  async createMediaCategory(categoryData) {
    const [category] = await db.insert(mediaCategories).values(categoryData).returning();
    return category;
  }
  async updateMediaCategory(id, categoryData) {
    const [updated] = await db.update(mediaCategories).set({ ...categoryData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(mediaCategories.id, id)).returning();
    return updated;
  }
  async deleteMediaCategory(id) {
    await db.delete(mediaCategories).where(eq(mediaCategories.id, id));
  }
  // Media content
  async getAllMedia(categoryId) {
    if (categoryId) {
      return await db.select().from(mediaContent).where(eq(mediaContent.categoryId, categoryId)).orderBy(desc(mediaContent.createdAt));
    }
    return await db.select().from(mediaContent).orderBy(desc(mediaContent.createdAt));
  }
  async getMediaById(id) {
    const [media] = await db.select().from(mediaContent).where(eq(mediaContent.id, id));
    return media;
  }
  async createMedia(mediaData) {
    const [media] = await db.insert(mediaContent).values(mediaData).returning();
    return media;
  }
  async updateMedia(id, mediaData) {
    const [updated] = await db.update(mediaContent).set({ ...mediaData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(mediaContent.id, id)).returning();
    return updated;
  }
  async deleteMedia(id) {
    await db.delete(mediaContent).where(eq(mediaContent.id, id));
  }
  // Scripture content
  async getAllScriptures() {
    return await db.select().from(scriptureContent).orderBy(scriptureContent.chapterNumber);
  }
  async getScriptureByChapter(chapterNumber) {
    const [scripture] = await db.select().from(scriptureContent).where(eq(scriptureContent.chapterNumber, chapterNumber));
    return scripture;
  }
  async createScripture(scriptureData) {
    const [scripture] = await db.insert(scriptureContent).values(scriptureData).returning();
    return scripture;
  }
  async updateScripture(id, scriptureData) {
    const [updated] = await db.update(scriptureContent).set({ ...scriptureData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(scriptureContent.id, id)).returning();
    return updated;
  }
  async deleteScripture(id) {
    await db.delete(scriptureContent).where(eq(scriptureContent.id, id));
  }
  // Sadhana content operations
  async getAllSadhanaContent(category) {
    if (category) {
      return await db.select().from(sadhanaContent).where(eq(sadhanaContent.category, category)).orderBy(sadhanaContent.orderNumber);
    }
    return await db.select().from(sadhanaContent).orderBy(sadhanaContent.category, sadhanaContent.orderNumber);
  }
  async getSadhanaContentById(id) {
    const [content] = await db.select().from(sadhanaContent).where(eq(sadhanaContent.id, id));
    return content;
  }
  async createSadhanaContent(contentData) {
    const [content] = await db.insert(sadhanaContent).values(contentData).returning();
    return content;
  }
  async updateSadhanaContent(id, contentData) {
    const [updated] = await db.update(sadhanaContent).set({ ...contentData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sadhanaContent.id, id)).returning();
    return updated;
  }
  async deleteSadhanaContent(id) {
    await db.delete(sadhanaContent).where(eq(sadhanaContent.id, id));
  }
  // Alarm sounds operations
  async getAllAlarmSounds() {
    return await db.select().from(alarmSounds).orderBy(desc(alarmSounds.isDefault), alarmSounds.name);
  }
  async getAlarmSoundById(id) {
    const [sound] = await db.select().from(alarmSounds).where(eq(alarmSounds.id, id));
    return sound;
  }
  async createAlarmSound(soundData) {
    const [sound] = await db.insert(alarmSounds).values(soundData).returning();
    return sound;
  }
  async updateAlarmSound(id, soundData) {
    const [updated] = await db.update(alarmSounds).set({ ...soundData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(alarmSounds.id, id)).returning();
    return updated;
  }
  async deleteAlarmSound(id) {
    await db.delete(alarmSounds).where(eq(alarmSounds.id, id));
  }
  // Japa audios operations
  async getAllJapaAudios() {
    return await db.select().from(japaAudios).orderBy(desc(japaAudios.isDefault), japaAudios.name);
  }
  async getJapaAudioById(id) {
    const [audio] = await db.select().from(japaAudios).where(eq(japaAudios.id, id));
    return audio;
  }
  async createJapaAudio(audioData) {
    const [audio] = await db.insert(japaAudios).values(audioData).returning();
    return audio;
  }
  async updateJapaAudio(id, audioData) {
    const [updated] = await db.update(japaAudios).set({ ...audioData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(japaAudios.id, id)).returning();
    return updated;
  }
  async deleteJapaAudio(id) {
    await db.delete(japaAudios).where(eq(japaAudios.id, id));
  }
  // Japa settings operations
  async getJapaSettings(userId) {
    const [settings] = await db.select().from(japaSettings).where(eq(japaSettings.userId, userId));
    return settings;
  }
  async upsertJapaSettings(settingsData) {
    const [settings] = await db.insert(japaSettings).values(settingsData).onConflictDoUpdate({
      target: japaSettings.userId,
      set: {
        ...settingsData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return settings;
  }
  // Admin operations
  async getAllUsers() {
    return await db.select().from(users).where(eq(users.emailVerified, true)).orderBy(desc(users.createdAt));
  }
  async updateUserAdminStatus(userId, isAdmin2) {
    const [updated] = await db.update(users).set({ isAdmin: isAdmin2, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return updated;
  }
  async deleteUser(userId) {
    await db.delete(users).where(eq(users.id, userId));
  }
  // Rate limiting
  async getRecentRegistrationAttempts(email, since) {
    return await db.select().from(registrationAttempts).where(and(
      eq(registrationAttempts.email, email),
      gte(registrationAttempts.attemptedAt, since)
    )).orderBy(desc(registrationAttempts.attemptedAt));
  }
  async recordRegistrationAttempt(email, ipAddress) {
    const [attempt] = await db.insert(registrationAttempts).values({
      email,
      ipAddress: ipAddress || null
    }).returning();
    return attempt;
  }
  async cleanupOldAttempts(before) {
    await db.delete(registrationAttempts).where(
      lte(registrationAttempts.attemptedAt, before)
    );
  }
  // Mahapuran titles operations
  async getAllMahapuranTitles(collectionType) {
    if (collectionType) {
      return await db.select().from(mahapuranTitles).where(eq(mahapuranTitles.collectionType, collectionType)).orderBy(mahapuranTitles.orderIndex, mahapuranTitles.title);
    }
    return await db.select().from(mahapuranTitles).orderBy(mahapuranTitles.orderIndex, mahapuranTitles.title);
  }
  async getMahapuranTitleById(id) {
    const [title] = await db.select().from(mahapuranTitles).where(eq(mahapuranTitles.id, id));
    return title;
  }
  async createMahapuranTitle(titleData) {
    const [title] = await db.insert(mahapuranTitles).values(titleData).returning();
    return title;
  }
  async updateMahapuranTitle(id, titleData) {
    const [updated] = await db.update(mahapuranTitles).set({ ...titleData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(mahapuranTitles.id, id)).returning();
    return updated;
  }
  async deleteMahapuranTitle(id) {
    await db.delete(mahapuranTitles).where(eq(mahapuranTitles.id, id));
  }
  // Mahapuran skandas operations
  async getAllMahapuranSkandas(mahapuranTitleId) {
    if (mahapuranTitleId) {
      return await db.select().from(mahapuranSkandas).where(eq(mahapuranSkandas.mahapuranTitleId, mahapuranTitleId)).orderBy(mahapuranSkandas.skandaNumber);
    }
    return await db.select().from(mahapuranSkandas).orderBy(mahapuranSkandas.mahapuranTitleId, mahapuranSkandas.skandaNumber);
  }
  async getMahapuranSkandaById(id) {
    const [skanda] = await db.select().from(mahapuranSkandas).where(eq(mahapuranSkandas.id, id));
    return skanda;
  }
  async createMahapuranSkanda(skandaData) {
    const [skanda] = await db.insert(mahapuranSkandas).values(skandaData).returning();
    return skanda;
  }
  async updateMahapuranSkanda(id, skandaData) {
    const [updated] = await db.update(mahapuranSkandas).set({ ...skandaData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(mahapuranSkandas.id, id)).returning();
    return updated;
  }
  async deleteMahapuranSkanda(id) {
    await db.delete(mahapuranSkandas).where(eq(mahapuranSkandas.id, id));
  }
  // Mahapuran chapters operations
  async getAllMahapuranChapters(skandaId) {
    if (skandaId) {
      return await db.select().from(mahapuranChapters).where(eq(mahapuranChapters.skandaId, skandaId)).orderBy(mahapuranChapters.chapterNumber);
    }
    return await db.select().from(mahapuranChapters).orderBy(mahapuranChapters.skandaId, mahapuranChapters.chapterNumber);
  }
  async getMahapuranChapterById(id) {
    const [chapter] = await db.select().from(mahapuranChapters).where(eq(mahapuranChapters.id, id));
    return chapter;
  }
  async createMahapuranChapter(chapterData) {
    const [chapter] = await db.insert(mahapuranChapters).values(chapterData).returning();
    return chapter;
  }
  async updateMahapuranChapter(id, chapterData) {
    const [updated] = await db.update(mahapuranChapters).set({ ...chapterData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(mahapuranChapters.id, id)).returning();
    return updated;
  }
  async deleteMahapuranChapter(id) {
    await db.delete(mahapuranChapters).where(eq(mahapuranChapters.id, id));
  }
  // User media favorites operations
  async getUserMediaFavorites(userId) {
    const favorites = await db.select({
      media: mediaContent
    }).from(userMediaFavorites).innerJoin(mediaContent, eq(userMediaFavorites.mediaId, mediaContent.id)).where(eq(userMediaFavorites.userId, userId)).orderBy(desc(userMediaFavorites.createdAt));
    return favorites.map((f) => f.media);
  }
  async addMediaFavorite(favoriteData) {
    const [favorite] = await db.insert(userMediaFavorites).values(favoriteData).returning();
    return favorite;
  }
  async removeMediaFavorite(userId, mediaId) {
    await db.delete(userMediaFavorites).where(
      and(
        eq(userMediaFavorites.userId, userId),
        eq(userMediaFavorites.mediaId, mediaId)
      )
    );
  }
  async isMediaFavorited(userId, mediaId) {
    const [favorite] = await db.select().from(userMediaFavorites).where(
      and(
        eq(userMediaFavorites.userId, userId),
        eq(userMediaFavorites.mediaId, mediaId)
      )
    );
    return !!favorite;
  }
  // Mahapuran PDFs operations
  async getAllMahapuranPdfs() {
    return await db.select().from(mahapuranPdfs).where(eq(mahapuranPdfs.isActive, true)).orderBy(mahapuranPdfs.orderIndex, mahapuranPdfs.languageName);
  }
  async getMahapuranPdfById(id) {
    const [pdf] = await db.select().from(mahapuranPdfs).where(eq(mahapuranPdfs.id, id));
    return pdf;
  }
  async getMahapuranPdfByLanguage(languageCode) {
    const [pdf] = await db.select().from(mahapuranPdfs).where(eq(mahapuranPdfs.languageCode, languageCode));
    return pdf;
  }
  async createMahapuranPdf(pdfData) {
    const [pdf] = await db.insert(mahapuranPdfs).values(pdfData).returning();
    return pdf;
  }
  async updateMahapuranPdf(id, pdfData) {
    const [updated] = await db.update(mahapuranPdfs).set({ ...pdfData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(mahapuranPdfs.id, id)).returning();
    return updated;
  }
  async deleteMahapuranPdf(id) {
    await db.delete(mahapuranPdfs).where(eq(mahapuranPdfs.id, id));
  }
  // Trisandhya PDFs operations
  async getAllTrisandhyaPdfs() {
    return await db.select().from(trisandhyaPdfs).where(eq(trisandhyaPdfs.isActive, true)).orderBy(trisandhyaPdfs.orderIndex, trisandhyaPdfs.languageName);
  }
  async getTrisandhyaPdfById(id) {
    const [pdf] = await db.select().from(trisandhyaPdfs).where(eq(trisandhyaPdfs.id, id));
    return pdf;
  }
  async createTrisandhyaPdf(pdfData) {
    const [pdf] = await db.insert(trisandhyaPdfs).values(pdfData).returning();
    return pdf;
  }
  async updateTrisandhyaPdf(id, pdfData) {
    const [updated] = await db.update(trisandhyaPdfs).set({ ...pdfData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(trisandhyaPdfs.id, id)).returning();
    return updated;
  }
  async deleteTrisandhyaPdf(id) {
    await db.delete(trisandhyaPdfs).where(eq(trisandhyaPdfs.id, id));
  }
  // Scripture PDFs operations
  async getAllScripturePdfs() {
    return await db.select().from(scripturePdfs).where(eq(scripturePdfs.isActive, true)).orderBy(scripturePdfs.orderIndex, scripturePdfs.languageName);
  }
  async getScripturePdfById(id) {
    const [pdf] = await db.select().from(scripturePdfs).where(eq(scripturePdfs.id, id));
    return pdf;
  }
  async createScripturePdf(pdfData) {
    const [pdf] = await db.insert(scripturePdfs).values(pdfData).returning();
    return pdf;
  }
  async updateScripturePdf(id, pdfData) {
    const [updated] = await db.update(scripturePdfs).set({ ...pdfData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(scripturePdfs.id, id)).returning();
    return updated;
  }
  async deleteScripturePdf(id) {
    await db.delete(scripturePdfs).where(eq(scripturePdfs.id, id));
  }
  // Notification sounds operations
  async getAllNotificationSounds() {
    return await db.select().from(notificationSounds).orderBy(notificationSounds.name);
  }
  async getNotificationSoundById(id) {
    const [sound] = await db.select().from(notificationSounds).where(eq(notificationSounds.id, id));
    return sound;
  }
  async createNotificationSound(soundData) {
    const [sound] = await db.insert(notificationSounds).values(soundData).returning();
    return sound;
  }
  async updateNotificationSound(id, soundData) {
    const [updated] = await db.update(notificationSounds).set({ ...soundData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationSounds.id, id)).returning();
    return updated;
  }
  async deleteNotificationSound(id) {
    await db.delete(notificationSounds).where(eq(notificationSounds.id, id));
  }
  // Notifications operations
  async getAllNotifications(limit) {
    const query = db.select().from(notifications).orderBy(desc(notifications.createdAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }
  async getNotificationById(id) {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }
  async getActiveNotifications() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(notifications).where(
      and(
        eq(notifications.sendToAll, true),
        or(
          isNull(notifications.expiresAt),
          sql2`${notifications.expiresAt} > ${now}`
        )
      )
    ).orderBy(desc(notifications.createdAt));
  }
  async createNotification(notificationData) {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }
  async updateNotification(id, notificationData) {
    const [updated] = await db.update(notifications).set(notificationData).where(eq(notifications.id, id)).returning();
    return updated;
  }
  async deleteNotification(id) {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
  // Notification receipts operations
  async getUserNotifications(userId, limit) {
    const query = db.select({
      notification: notifications,
      receipt: notificationReceipts
    }).from(notificationReceipts).innerJoin(notifications, eq(notificationReceipts.notificationId, notifications.id)).where(eq(notificationReceipts.userId, userId)).orderBy(desc(notificationReceipts.deliveredAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }
  async getUnreadNotificationCount(userId) {
    const result = await db.select({ count: sql2`count(*)` }).from(notificationReceipts).where(
      and(
        eq(notificationReceipts.userId, userId),
        eq(notificationReceipts.isRead, false)
      )
    );
    return Number(result[0]?.count || 0);
  }
  async createNotificationReceipt(receiptData) {
    const [receipt] = await db.insert(notificationReceipts).values(receiptData).returning();
    return receipt;
  }
  async markNotificationAsRead(userId, notificationId) {
    await db.update(notificationReceipts).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where(
      and(
        eq(notificationReceipts.userId, userId),
        eq(notificationReceipts.notificationId, notificationId)
      )
    );
  }
  async markAllNotificationsAsRead(userId) {
    await db.update(notificationReceipts).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where(eq(notificationReceipts.userId, userId));
  }
  // Notification preferences operations
  async getNotificationPreferences(userId) {
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return prefs;
  }
  async createNotificationPreferences(prefsData) {
    const [prefs] = await db.insert(notificationPreferences).values(prefsData).returning();
    return prefs;
  }
  async updateNotificationPreferences(userId, prefsData) {
    const [updated] = await db.update(notificationPreferences).set({ ...prefsData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationPreferences.userId, userId)).returning();
    return updated;
  }
  // Push subscriptions operations
  async getPushSubscription(userId, endpoint) {
    const [sub] = await db.select().from(pushSubscriptions).where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );
    return sub;
  }
  async getAllPushSubscriptions(userId) {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }
  async createPushSubscription(subData) {
    const [sub] = await db.insert(pushSubscriptions).values(subData).returning();
    return sub;
  }
  async deletePushSubscription(endpoint) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }
  async updatePushSubscriptionLastUsed(endpoint) {
    await db.update(pushSubscriptions).set({ lastUsedAt: /* @__PURE__ */ new Date() }).where(eq(pushSubscriptions.endpoint, endpoint));
  }
};
var storage = new DatabaseStorage();

// server/googleAuth.ts
import passport2 from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import MemoryStore from "memorystore";

// server/localAuth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import crypto from "crypto";
function setupLocalAuth() {
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const existingUser = await storage.getUserByEmail(email);
          if (existingUser) {
            if (existingUser.emailVerified) {
              return done(null, false, { message: "Email already registered" });
            }
            await storage.deleteUser(existingUser.id);
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const verificationCode = Math.floor(1e5 + Math.random() * 9e5).toString();
          const verificationToken = crypto.randomBytes(32).toString("hex");
          const verificationCodeExpiry = /* @__PURE__ */ new Date();
          verificationCodeExpiry.setMinutes(verificationCodeExpiry.getMinutes() + 15);
          const user = await storage.createLocalUser({
            email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            verificationCode,
            verificationToken,
            verificationCodeExpiry,
            emailVerified: false
          });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.emailVerified) {
            return done(null, false, { message: "Please verify your email first" });
          }
          if (!user.password) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// server/googleAuth.ts
function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable must be set for secure session management");
  }
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const MemStore = MemoryStore(session);
  const sessionStore = new MemStore({
    checkPeriod: sessionTtl
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  if (process.env.NODE_ENV === "production") {
    app2.set("trust proxy", 1);
  }
  app2.use(getSession());
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  setupLocalAuth();
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("Google OAuth credentials not configured. Google login will not work.");
  } else {
    const callbackURL = process.env.NODE_ENV === "production" ? `https://${process.env.REPL_SLUG}.replit.app/api/auth/google/callback` : "http://localhost:5000/api/auth/google/callback";
    passport2.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || "";
            const firstName = profile.name?.givenName || "";
            const lastName = profile.name?.familyName || "";
            const profileImageUrl = profile.photos?.[0]?.value || "";
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
              if (!existingUser.emailVerified) {
                return done(null, false, { message: "Please verify your email through the registration process before using Google sign-in." });
              }
              await storage.upsertUser({
                id: existingUser.id,
                email,
                firstName,
                lastName,
                profileImageUrl,
                emailVerified: true
              });
              return done(null, { id: existingUser.id, email, firstName, lastName, profileImageUrl });
            } else {
              return done(null, false, { message: "No account found with this email. Please register first." });
            }
          } catch (error) {
            done(error);
          }
        }
      )
    );
    app2.get("/api/auth/google", passport2.authenticate("google", {
      scope: ["profile", "email"]
    }));
    app2.get(
      "/api/auth/google/callback",
      passport2.authenticate("google", {
        failureRedirect: "/login?error=google_signin_failed",
        failureMessage: true
      }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }
  passport2.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport2.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/login");
      });
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
var isAdmin = async (req, res, next) => {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await storage.getUser(user.id);
  if (!dbUser || !dbUser.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};

// server/middleware/rateLimiter.ts
var RateLimiter = class {
  constructor(options) {
    this.options = options;
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 6e4);
  }
  requests = /* @__PURE__ */ new Map();
  cleanupInterval;
  middleware() {
    return (req, res, next) => {
      const key = this.getKey(req);
      const now = Date.now();
      const windowStart = now - this.options.windowMs;
      let record = this.requests.get(key);
      if (!record || record.resetTime < windowStart) {
        record = {
          count: 1,
          resetTime: now + this.options.windowMs
        };
        this.requests.set(key, record);
        res.set("X-RateLimit-Remaining", (this.options.maxRequests - 1).toString());
        res.set("X-RateLimit-Reset", record.resetTime.toString());
        return next();
      }
      if (record.count >= this.options.maxRequests) {
        const resetTime = Math.ceil((record.resetTime - now) / 1e3);
        res.set("X-RateLimit-Remaining", "0");
        res.set("X-RateLimit-Reset", record.resetTime.toString());
        return res.status(429).json({
          message: this.options.message || "Too many requests, please try again later.",
          retryAfter: resetTime
        });
      }
      record.count++;
      res.set("X-RateLimit-Remaining", (this.options.maxRequests - record.count).toString());
      res.set("X-RateLimit-Reset", record.resetTime.toString());
      if (this.options.skipSuccessfulRequests && res.statusCode < 400) {
        record.count--;
      } else if (this.options.skipFailedRequests && res.statusCode >= 400) {
        record.count--;
      }
      next();
    };
  }
  getKey(req) {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "";
    return `${ip}:${userAgent}`;
  }
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    this.requests.forEach((record, key) => {
      if (record.resetTime < now) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.requests.delete(key));
  }
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
};
var authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  maxRequests: 5,
  // 5 attempts per 15 minutes for auth
  message: "Too many authentication attempts. Please try again in 15 minutes."
});
var apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  maxRequests: 100,
  // 100 requests per 15 minutes for general API
  message: "Too many requests. Please try again later."
});
var fileUploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  maxRequests: 10,
  // 10 uploads per hour
  message: "Too many file uploads. Please try again in an hour."
});
process.on("SIGINT", () => {
  authRateLimiter.destroy();
  apiRateLimiter.destroy();
  fileUploadRateLimiter.destroy();
});
process.on("SIGTERM", () => {
  authRateLimiter.destroy();
  apiRateLimiter.destroy();
  fileUploadRateLimiter.destroy();
});

// server/middleware/logger.ts
var Logger = class {
  logs = [];
  maxLogs = 1e3;
  log(level, message, extra = {}) {
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      ...extra
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    if (process.env.NODE_ENV === "development") {
      const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`;
      switch (level) {
        case "error":
          console.error(`${prefix}: ${message}`, extra.error || "");
          break;
        case "warn":
          console.warn(`${prefix}: ${message}`);
          break;
        default:
          console.log(`${prefix}: ${message}`);
      }
    }
  }
  info(message, extra) {
    this.log("info", message, extra);
  }
  warn(message, extra) {
    this.log("warn", message, extra);
  }
  error(message, error, extra) {
    this.log("error", message, { ...extra, error });
  }
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      const originalSend = res.send;
      res.send = function(body) {
        const duration = Date.now() - start;
        const logEntry = {
          userId: req.user?.id,
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.get("User-Agent"),
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration
        };
        if (res.statusCode >= 500) {
          logger.error(`Server error: ${req.method} ${req.url}`, void 0, logEntry);
        } else if (res.statusCode >= 400) {
          logger.warn(`Client error: ${req.method} ${req.url}`, logEntry);
        } else if (req.url.startsWith("/api")) {
          logger.info(`API request: ${req.method} ${req.url}`, logEntry);
        }
        return originalSend.call(this, body);
      };
      next();
    };
  }
  getLogs(level, limit = 100) {
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = filteredLogs.filter((log2) => log2.level === level);
    }
    return filteredLogs.slice(-limit);
  }
  clearLogs() {
    this.logs = [];
  }
};
var logger = new Logger();
process.on("SIGINT", () => {
  logger.info("Server shutting down gracefully");
});
process.on("SIGTERM", () => {
  logger.info("Server shutting down gracefully");
});

// server/routes.ts
import passport3 from "passport";

// server/sendgrid.ts
import sgMail from "@sendgrid/mail";
var connectionSettings;
async function getCredentials() {
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    return {
      apiKey: process.env.SENDGRID_API_KEY,
      email: process.env.SENDGRID_FROM_EMAIL
    };
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("SendGrid not configured. Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables or configure the SendGrid connector.");
  }
  try {
    connectionSettings = await fetch(
      "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=sendgrid",
      {
        headers: {
          "Accept": "application/json",
          "X_REPLIT_TOKEN": xReplitToken
        }
      }
    ).then((res) => res.json()).then((data) => data.items?.[0]);
    if (connectionSettings && connectionSettings.settings.api_key && connectionSettings.settings.from_email) {
      return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
    }
  } catch (error) {
    console.error("Failed to fetch SendGrid connector credentials:", error);
  }
  throw new Error("SendGrid not configured. Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables or configure the SendGrid connector.");
}
async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}
async function sendVerificationCodeEmail(to, firstName, verificationCode, verificationToken) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const verificationUrl = process.env.NODE_ENV === "production" ? `https://${process.env.REPL_SLUG}.replit.app/api/auth/verify-email?token=${verificationToken}` : `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
    const msg = {
      to,
      from: fromEmail,
      subject: "Verify your Trisandhya Sadhana account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #f97316; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .code { font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: monospace; }
            .button { display: inline-block; background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .divider { margin: 30px 0; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>\u{1F549}\uFE0F Trisandhya Sadhana Companion</h1>
            </div>
            <div class="content">
              <p>Namaste ${firstName},</p>
              <p>Welcome to Trisandhya Sadhana Companion! We're delighted to have you join our spiritual community.</p>
              <p>Please verify your email address using one of the following methods:</p>
              
              <h3>Option 1: Enter Verification Code</h3>
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your verification code:</p>
                <div class="code">${verificationCode}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">This code expires in 15 minutes</p>
              </div>
              
              <div class="divider">OR</div>
              
              <h3>Option 2: Click Verification Link</h3>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${verificationUrl}</p>
              
              <p style="margin-top: 30px;">Jai Kalki Avatar,<br>The Trisandhya Sadhana Team</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    await client.send(msg);
    console.log("Verification code email sent to:", to);
  } catch (error) {
    console.error("Error sending verification code email:", error);
    throw new Error("Failed to send verification email");
  }
}
async function sendPasswordResetEmail(to, firstName, resetCode) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const msg = {
      to,
      from: fromEmail,
      subject: "Reset your Trisandhya Sadhana password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #f97316; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .code { font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: monospace; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>\u{1F549}\uFE0F Trisandhya Sadhana Companion</h1>
            </div>
            <div class="content">
              <p>Namaste ${firstName},</p>
              <p>We received a request to reset your password. Use the code below to reset your password:</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your password reset code:</p>
                <div class="code">${resetCode}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">This code expires in 15 minutes</p>
              </div>
              
              <p style="color: #dc2626; margin-top: 20px;"><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
              
              <p style="margin-top: 30px;">Jai Kalki Avatar,<br>The Trisandhya Sadhana Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    await client.send(msg);
    console.log("Password reset email sent to:", to);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
async function sendWelcomeEmail(to, firstName) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const msg = {
      to,
      from: fromEmail,
      subject: "Welcome to Trisandhya Sadhana Companion!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>\u{1F549}\uFE0F Welcome to Trisandhya Sadhana!</h1>
            </div>
            <div class="content">
              <p>Namaste ${firstName},</p>
              <p>Your email has been verified successfully! You can now access all the features of Trisandhya Sadhana Companion:</p>
              <div class="feature">
                <strong>\u{1F514} Smart Alarms</strong><br>
                Set intelligent reminders for Pratah, Madhyahna, and Sayam sadhana
              </div>
              <div class="feature">
                <strong>\u{1F4CA} Progress Tracking</strong><br>
                Monitor your daily practice and build meaningful streaks
              </div>
              <div class="feature">
                <strong>\u{1F4D6} Sacred Content</strong><br>
                Access Mahapuran Path and spiritual media library
              </div>
              <p style="margin-top: 30px;">Begin your spiritual journey today!</p>
              <p>Jai Kalki Avatar,<br>The Trisandhya Sadhana Team</p>
            </div>
            <div class="footer">
              <p>May your practice bring you peace and spiritual growth.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    await client.send(msg);
    console.log("Welcome email sent to:", to);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

// server/routes.ts
init_s3_upload();
init_schema();
import bcrypt2 from "bcrypt";
import crypto2 from "crypto";
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.post("/api/auth/register", authRateLimiter.middleware(), async (req, res, next) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1e3);
      const recentAttempts = await storage.getRecentRegistrationAttempts(
        validatedData.email,
        fifteenMinutesAgo
      );
      if (recentAttempts.length >= 3) {
        return res.status(429).json({
          message: "Too many registration attempts. Please try again in 15 minutes."
        });
      }
      const ipAddress = req.ip || req.socket.remoteAddress;
      await storage.recordRegistrationAttempt(validatedData.email, ipAddress);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
      storage.cleanupOldAttempts(oneDayAgo).catch((err) => console.error("Failed to cleanup old attempts:", err));
      passport3.authenticate(
        "local-signup",
        async (err, user, info) => {
          if (err) {
            return res.status(500).json({ message: "Registration failed" });
          }
          if (!user) {
            return res.status(400).json({ message: info?.message || "Registration failed" });
          }
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
            console.error("Failed to send verification email:", emailError);
            try {
              await storage.deleteUser(user.id);
            } catch (deleteError) {
              console.error(
                "Failed to delete user after email error:",
                deleteError
              );
            }
            return res.status(500).json({
              message: "Failed to send verification email. Please check your email configuration and try again."
            });
          }
        }
      )(req, res, next);
    } catch (error) {
      res.status(400).json({ message: error.message || "Invalid registration data" });
    }
  });
  app2.post("/api/auth/verify-code", authRateLimiter.middleware(), async (req, res) => {
    try {
      const validatedData = verifyCodeSchema.parse(req.body);
      const user = await storage.verifyUserCode(
        validatedData.email,
        validatedData.code
      );
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
          lastName: user.lastName
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Invalid verification data" });
    }
  });
  app2.post("/api/auth/resend-verification", authRateLimiter.middleware(), async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1e3);
      const recentAttempts = await storage.getRecentRegistrationAttempts(
        email,
        fifteenMinutesAgo
      );
      if (recentAttempts.length >= 3) {
        return res.status(429).json({
          message: "Too many verification requests. Please try again in 15 minutes."
        });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      const ipAddress = req.ip || req.socket.remoteAddress;
      await storage.recordRegistrationAttempt(email, ipAddress);
      const verificationCode = Math.floor(
        1e5 + Math.random() * 9e5
      ).toString();
      const verificationToken = crypto2.randomBytes(32).toString("hex");
      const verificationCodeExpiry = /* @__PURE__ */ new Date();
      verificationCodeExpiry.setMinutes(
        verificationCodeExpiry.getMinutes() + 15
      );
      await storage.updateVerificationCode(
        email,
        verificationCode,
        verificationToken,
        verificationCodeExpiry
      );
      try {
        await sendVerificationCodeEmail(
          email,
          // Use the email from request since it's guaranteed to be string
          user.firstName || "User",
          verificationCode,
          verificationToken
        );
      } catch (emailError) {
        console.error("Failed to resend verification email:", emailError);
        return res.status(500).json({ message: "Failed to send verification email" });
      }
      res.json({
        message: "Verification email resent successfully. Please check your inbox."
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });
  app2.post("/api/auth/forgot-password", authRateLimiter.middleware(), async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1e3);
      const recentAttempts = await storage.getRecentRegistrationAttempts(
        validatedData.email,
        fifteenMinutesAgo
      );
      if (recentAttempts.length >= 3) {
        return res.status(429).json({
          message: "Too many password reset requests. Please try again in 15 minutes."
        });
      }
      const resetCode = Math.floor(1e5 + Math.random() * 9e5).toString();
      const user = await storage.setResetPasswordCode(
        validatedData.email,
        resetCode
      );
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }
      const ipAddress = req.ip || req.socket.remoteAddress;
      await storage.recordRegistrationAttempt(validatedData.email, ipAddress);
      try {
        await sendPasswordResetEmail(
          validatedData.email,
          // Use the validated email from request
          user.firstName || "User",
          resetCode
        );
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        return res.status(500).json({ message: "Failed to send reset email" });
      }
      res.json({
        message: "Password reset code has been sent to your email.",
        email: validatedData.email
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });
  app2.post("/api/auth/reset-password", authRateLimiter.middleware(), async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const hashedPassword = await bcrypt2.hash(validatedData.password, 10);
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
    } catch (error) {
      res.status(400).json({ message: error.message || "Invalid reset data" });
    }
  });
  app2.post("/api/auth/login", authRateLimiter.middleware(), async (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      passport3.authenticate("local-login", (err, user, info) => {
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
              isAdmin: user.isAdmin
            }
          });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: error.message || "Invalid login data" });
    }
  });
  app2.get("/api/auth/verify-email", async (req, res) => {
    try {
      const token = req.query.token;
      if (!token) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>\u274C Invalid Verification Link</h1>
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
            <h1>\u274C Verification Failed</h1>
            <p>This verification link is invalid or has expired.</p>
            <a href="/login" style="color: #f97316;">Go to Login</a>
          </body>
          </html>
        `);
      }
      await sendWelcomeEmail(user.email, user.firstName);
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
            <h1>\u2705 Email Verified!</h1>
            <p>Your email has been successfully verified.</p>
            <p>You can now log in to your account.</p>
            <a href="/login" class="button">Go to Login</a>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      logger.error("Error verifying email", error, {
        ip: req.ip
      });
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>\u274C Verification Error</h1>
          <p>An error occurred during verification. Please try again later.</p>
        </body>
        </html>
      `);
    }
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      logger.error("Error fetching user", error, {
        userId: req.user?.id,
        ip: req.ip
      });
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  });
  app2.get("/api/alarm-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      let settings = await storage.getAlarmSettings(userId);
      if (!settings) {
        settings = await storage.upsertAlarmSettings({
          userId,
          pratahEnabled: true,
          madhyahnaEnabled: true,
          sayamEnabled: true,
          volume: 80
        });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching alarm settings:", error);
      res.status(500).json({ message: "Failed to fetch alarm settings" });
    }
  });
  app2.post("/api/alarm-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertAlarmSettingsSchema.parse({
        ...req.body,
        userId
      });
      const settings = await storage.upsertAlarmSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating alarm settings:", error);
      res.status(400).json({ message: "Invalid alarm settings data" });
    }
  });
  app2.get(
    "/api/sadhana-progress/today",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
            japCount: 0
          });
        }
        res.json(progress);
      } catch (error) {
        console.error("Error fetching sadhana progress:", error);
        res.status(500).json({ message: "Failed to fetch sadhana progress" });
      }
    }
  );
  app2.post("/api/sadhana-progress", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertSadhanaProgressSchema.parse({
        ...req.body,
        userId
      });
      const progress = await storage.upsertSadhanaProgress(validatedData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating sadhana progress:", error);
      res.status(400).json({ message: "Invalid progress data" });
    }
  });
  app2.get(
    "/api/sadhana-progress/stats",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const stats = await storage.getUserStats(userId);
        res.json(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Failed to fetch user stats" });
      }
    }
  );
  app2.get(
    "/api/sadhana-progress/range",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        const progress = await storage.getSadhanaProgressByDateRange(
          userId,
          startDate,
          endDate
        );
        res.json(progress);
      } catch (error) {
        console.error("Error fetching progress range:", error);
        res.status(500).json({ message: "Failed to fetch progress range" });
      }
    }
  );
  app2.get("/api/media-categories", async (req, res) => {
    try {
      const categories = await storage.getAllMediaCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching media categories:", error);
      res.status(500).json({ message: "Failed to fetch media categories" });
    }
  });
  app2.get("/api/media", async (req, res) => {
    try {
      const categoryId = req.query.categoryId;
      const media = await storage.getAllMedia(categoryId);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });
  app2.get("/api/media/:id", async (req, res) => {
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
  app2.get("/api/scriptures", async (req, res) => {
    try {
      const scriptures = await storage.getAllScriptures();
      res.json(scriptures);
    } catch (error) {
      console.error("Error fetching scriptures:", error);
      res.status(500).json({ message: "Failed to fetch scriptures" });
    }
  });
  app2.get("/api/scriptures/:chapter", async (req, res) => {
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
  app2.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.patch(
    "/api/admin/users/:id/admin",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { isAdmin: adminStatus } = req.body;
        const user = await storage.updateUserAdminStatus(
          req.params.id,
          adminStatus
        );
        res.json(user);
      } catch (error) {
        console.error("Error updating user admin status:", error);
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  );
  app2.delete(
    "/api/admin/users/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteUser(req.params.id);
        res.json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
      }
    }
  );
  app2.post("/api/admin/media", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertMediaContentSchema.parse(req.body);
      const media = await storage.createMedia(validatedData);
      res.json(media);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });
  app2.patch(
    "/api/admin/media/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const media = await storage.updateMedia(req.params.id, req.body);
        res.json(media);
      } catch (error) {
        console.error("Error updating media:", error);
        res.status(500).json({ message: "Failed to update media" });
      }
    }
  );
  app2.delete(
    "/api/admin/media/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const media = await storage.getMediaById(req.params.id);
        if (media && media.type === "audio") {
          const { extractS3Key: extractS3Key2, deleteFromS3: deleteFromS32 } = await Promise.resolve().then(() => (init_s3_upload(), s3_upload_exports));
          const key = extractS3Key2(media.url);
          if (key) {
            await deleteFromS32(key);
          }
        }
        await storage.deleteMedia(req.params.id);
        res.json({ message: "Media deleted successfully" });
      } catch (error) {
        console.error("Error deleting media:", error);
        res.status(500).json({ message: "Failed to delete media" });
      }
    }
  );
  app2.post(
    "/api/admin/media-categories",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMediaCategorySchema: insertMediaCategorySchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertMediaCategorySchema2.parse(req.body);
        const category = await storage.createMediaCategory(validatedData);
        res.json(category);
      } catch (error) {
        console.error("Error creating media category:", error);
        res.status(400).json({ message: "Invalid category data" });
      }
    }
  );
  app2.patch(
    "/api/admin/media-categories/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const category = await storage.updateMediaCategory(
          req.params.id,
          req.body
        );
        res.json(category);
      } catch (error) {
        console.error("Error updating media category:", error);
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  );
  app2.delete(
    "/api/admin/media-categories/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        await storage.deleteMediaCategory(req.params.id);
        res.json({ message: "Category deleted successfully" });
      } catch (error) {
        console.error("Error deleting media category:", error);
        res.status(500).json({ message: "Failed to delete category" });
      }
    }
  );
  app2.post(
    "/api/admin/media/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req, res) => {
      try {
        const multer2 = await import("multer");
        const multerS32 = (await import("multer-s3")).default;
        const { S3Client: S3Client2 } = await import("@aws-sdk/client-s3");
        const path4 = await import("path");
        const s3Client = new S3Client2({
          region: process.env.S3_REGION,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
          }
        });
        const bucketName = process.env.S3_BUCKET_NAME;
        const audioMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac"
        ];
        const upload = multer2.default({
          storage: multerS32({
            s3: s3Client,
            bucket: bucketName,
            contentType: multerS32.AUTO_CONTENT_TYPE,
            metadata: (req2, file, cb) => {
              cb(null, { fieldName: file.fieldname });
            },
            key: (req2, file, cb) => {
              const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
              const ext = path4.default.extname(file.originalname);
              const basename = path4.default.basename(file.originalname, ext);
              cb(null, `media/${basename}-${uniqueSuffix}${ext}`);
            }
          }),
          limits: { fileSize: 50 * 1024 * 1024 },
          fileFilter: (req2, file, cb) => {
            if (audioMimeTypes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(
                new Error(
                  `Invalid file type for media: ${file.mimetype}. Only audio files are allowed.`
                )
              );
            }
          }
        });
        upload.single("file")(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const fileData = {
            url: req.file.location || req.file.path,
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size
          };
          if (!fileData.url || fileData.url.trim() === "") {
            return res.status(400).json({ message: "Upload failed: No URL generated" });
          }
          res.json(fileData);
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  );
  app2.post(
    "/api/admin/alarm-sounds/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req, res) => {
      try {
        const multer2 = await import("multer");
        const multerS32 = (await import("multer-s3")).default;
        const { S3Client: S3Client2 } = await import("@aws-sdk/client-s3");
        const path4 = await import("path");
        const s3Client = new S3Client2({
          region: process.env.S3_REGION,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
          }
        });
        const bucketName = process.env.S3_BUCKET_NAME;
        const audioMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac"
        ];
        const upload = multer2.default({
          storage: multerS32({
            s3: s3Client,
            bucket: bucketName,
            contentType: multerS32.AUTO_CONTENT_TYPE,
            metadata: (req2, file, cb) => {
              cb(null, { fieldName: file.fieldname });
            },
            key: (req2, file, cb) => {
              const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
              const ext = path4.default.extname(file.originalname);
              const basename = path4.default.basename(file.originalname, ext);
              cb(null, `alarm-sounds/${basename}-${uniqueSuffix}${ext}`);
            }
          }),
          limits: { fileSize: 10 * 1024 * 1024 },
          fileFilter: (req2, file, cb) => {
            if (!audioMimeTypes.includes(file.mimetype)) {
              cb(
                new Error(
                  `Invalid file type for alarm sounds: ${file.mimetype}. Only audio files (MP3, WAV, OGG, AAC, M4A, FLAC) are allowed.`
                )
              );
              return;
            }
            const originalName = file.originalname || "";
            const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com", ".jar", ".js", ".php", ".asp"];
            const hasDangerousExt = dangerousExtensions.some(
              (ext) => originalName.toLowerCase().endsWith(ext)
            );
            if (hasDangerousExt) {
              cb(new Error("File type not allowed for security reasons."));
              return;
            }
            cb(null, true);
          }
        });
        upload.single("file")(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const file = req.file;
          const fileData = {
            url: file.location || file.path,
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size
          };
          if (!fileData.url || fileData.url.trim() === "") {
            return res.status(400).json({ message: "Upload failed: No URL generated" });
          }
          res.json(fileData);
        });
      } catch (error) {
        console.error("Error uploading alarm sound:", error);
        res.status(500).json({ message: "Failed to upload alarm sound" });
      }
    }
  );
  app2.get("/api/japa-audios", isAuthenticated, async (_req, res) => {
    try {
      const audios = await storage.getAllJapaAudios();
      res.json(audios);
    } catch (error) {
      console.error("Error getting japa audios:", error);
      res.status(500).json({ message: "Failed to fetch japa audios" });
    }
  });
  app2.post(
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
    }
  );
  app2.patch(
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
    }
  );
  app2.delete(
    "/api/admin/japa-audios/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const audio = await storage.getJapaAudioById(req.params.id);
        if (audio) {
          const { extractS3Key: extractS3Key2, deleteFromS3: deleteFromS32 } = await Promise.resolve().then(() => (init_s3_upload(), s3_upload_exports));
          const key = extractS3Key2(audio.url);
          if (key) {
            await deleteFromS32(key);
          }
        }
        await storage.deleteJapaAudio(req.params.id);
        res.json({ message: "Japa audio deleted successfully" });
      } catch (error) {
        console.error("Error deleting japa audio:", error);
        res.status(500).json({ message: "Failed to delete japa audio" });
      }
    }
  );
  app2.post(
    "/api/admin/japa-audios/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req, res) => {
      try {
        const multer2 = await import("multer");
        const multerS32 = (await import("multer-s3")).default;
        const { S3Client: S3Client2 } = await import("@aws-sdk/client-s3");
        const path4 = await import("path");
        const s3Client = new S3Client2({
          region: process.env.S3_REGION,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
          }
        });
        const bucketName = process.env.S3_BUCKET_NAME;
        const audioMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac"
        ];
        const upload = multer2.default({
          storage: multerS32({
            s3: s3Client,
            bucket: bucketName,
            contentType: multerS32.AUTO_CONTENT_TYPE,
            metadata: (req2, file, cb) => {
              cb(null, { fieldName: file.fieldname });
            },
            key: (req2, file, cb) => {
              const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
              const ext = path4.default.extname(file.originalname);
              const basename = path4.default.basename(file.originalname, ext);
              cb(null, `japa-audios/${basename}-${uniqueSuffix}${ext}`);
            }
          }),
          limits: { fileSize: 10 * 1024 * 1024 },
          fileFilter: (req2, file, cb) => {
            if (audioMimeTypes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(
                new Error(
                  `Invalid file type for japa audios: ${file.mimetype}. Only audio files are allowed.`
                )
              );
            }
          }
        });
        upload.single("file")(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const fileData = {
            url: req.file.location || req.file.path,
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size
          };
          if (!fileData.url || fileData.url.trim() === "") {
            return res.status(400).json({ message: "Upload failed: No URL generated" });
          }
          res.json(fileData);
        });
      } catch (error) {
        console.error("Error uploading japa audio:", error);
        res.status(500).json({ message: "Failed to upload japa audio" });
      }
    }
  );
  app2.get("/api/japa-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      let settings = await storage.getJapaSettings(userId);
      if (!settings) {
        settings = await storage.upsertJapaSettings({
          userId,
          hapticEnabled: false,
          soundEnabled: true,
          dailyGoal: 108
        });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error getting japa settings:", error);
      res.status(500).json({ message: "Failed to fetch japa settings" });
    }
  });
  app2.patch("/api/japa-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const settings = await storage.upsertJapaSettings({
        userId,
        ...req.body
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating japa settings:", error);
      res.status(500).json({ message: "Failed to update japa settings" });
    }
  });
  app2.post("/api/japa/increment", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
          japCompleted: false
        });
      } else {
        progress = await storage.upsertSadhanaProgress({
          ...progress,
          japCount: progress.japCount + count
        });
      }
      res.json(progress);
    } catch (error) {
      console.error("Error incrementing japa count:", error);
      res.status(500).json({ message: "Failed to increment japa count" });
    }
  });
  app2.post(
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
    }
  );
  app2.patch(
    "/api/admin/scriptures/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const scripture = await storage.updateScripture(
          req.params.id,
          req.body
        );
        res.json(scripture);
      } catch (error) {
        console.error("Error updating scripture:", error);
        res.status(500).json({ message: "Failed to update scripture" });
      }
    }
  );
  app2.delete(
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
    }
  );
  app2.get("/api/sadhana-content", async (req, res) => {
    try {
      const category = req.query.category;
      const content = await storage.getAllSadhanaContent(category);
      res.json(content);
    } catch (error) {
      console.error("Error fetching sadhana content:", error);
      res.status(500).json({ message: "Failed to fetch sadhana content" });
    }
  });
  app2.post(
    "/api/admin/sadhana-content",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertSadhanaContentSchema: insertSadhanaContentSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertSadhanaContentSchema2.parse(req.body);
        const content = await storage.createSadhanaContent(validatedData);
        res.json(content);
      } catch (error) {
        console.error("Error creating sadhana content:", error);
        res.status(400).json({ message: "Invalid sadhana content data" });
      }
    }
  );
  app2.patch(
    "/api/admin/sadhana-content/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const content = await storage.updateSadhanaContent(
          req.params.id,
          req.body
        );
        res.json(content);
      } catch (error) {
        console.error("Error updating sadhana content:", error);
        res.status(500).json({ message: "Failed to update sadhana content" });
      }
    }
  );
  app2.delete(
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
    }
  );
  app2.get("/api/alarm-sounds", isAuthenticated, async (req, res) => {
    try {
      const sounds = await storage.getAllAlarmSounds();
      res.json(sounds);
    } catch (error) {
      console.error("Error fetching alarm sounds:", error);
      res.status(500).json({ message: "Failed to fetch alarm sounds" });
    }
  });
  app2.post(
    "/api/admin/alarm-sounds",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertAlarmSoundSchema: insertAlarmSoundSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertAlarmSoundSchema2.parse(req.body);
        const sound = await storage.createAlarmSound(validatedData);
        res.json(sound);
      } catch (error) {
        console.error("Error creating alarm sound:", error);
        res.status(400).json({ message: "Invalid alarm sound data" });
      }
    }
  );
  app2.patch(
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
    }
  );
  app2.delete(
    "/api/admin/alarm-sounds/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const sound = await storage.getAlarmSoundById(req.params.id);
        if (sound) {
          const { extractS3Key: extractS3Key2, deleteFromS3: deleteFromS32 } = await Promise.resolve().then(() => (init_s3_upload(), s3_upload_exports));
          const key = extractS3Key2(sound.url);
          if (key) {
            await deleteFromS32(key);
          }
        }
        await storage.deleteAlarmSound(req.params.id);
        res.json({ message: "Alarm sound deleted successfully" });
      } catch (error) {
        console.error("Error deleting alarm sound:", error);
        res.status(500).json({ message: "Failed to delete alarm sound" });
      }
    }
  );
  app2.get("/api/mahapuran-titles", async (req, res) => {
    try {
      const titles = await storage.getAllMahapuranTitles("mahapuran");
      res.json(titles);
    } catch (error) {
      console.error("Error fetching mahapuran titles:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran titles" });
    }
  });
  app2.get("/api/scripture-titles", async (req, res) => {
    try {
      const titles = await storage.getAllMahapuranTitles("other");
      res.json(titles);
    } catch (error) {
      console.error("Error fetching scripture titles:", error);
      res.status(500).json({ message: "Failed to fetch scripture titles" });
    }
  });
  app2.get("/api/mahapuran-titles/:id", async (req, res) => {
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
  app2.get("/api/mahapuran-skandas", async (req, res) => {
    try {
      const titleId = req.query.mahapuranTitleId;
      const skandas = await storage.getAllMahapuranSkandas(titleId);
      res.json(skandas);
    } catch (error) {
      console.error("Error fetching mahapuran skandas:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran skandas" });
    }
  });
  app2.get("/api/mahapuran-skandas/:id", async (req, res) => {
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
  app2.get("/api/mahapuran-chapters", async (req, res) => {
    try {
      const skandaId = req.query.skandaId;
      const chapters = await storage.getAllMahapuranChapters(skandaId);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching mahapuran chapters:", error);
      res.status(500).json({ message: "Failed to fetch mahapuran chapters" });
    }
  });
  app2.get("/api/mahapuran-chapters/:id", async (req, res) => {
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
  app2.post(
    "/api/admin/mahapuran-titles",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranTitleSchema: insertMahapuranTitleSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertMahapuranTitleSchema2.parse(req.body);
        const title = await storage.createMahapuranTitle(validatedData);
        res.json(title);
      } catch (error) {
        console.error("Error creating mahapuran title:", error);
        res.status(400).json({ message: "Invalid mahapuran title data" });
      }
    }
  );
  app2.patch(
    "/api/admin/mahapuran-titles/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const title = await storage.updateMahapuranTitle(
          req.params.id,
          req.body
        );
        res.json(title);
      } catch (error) {
        console.error("Error updating mahapuran title:", error);
        res.status(500).json({ message: "Failed to update mahapuran title" });
      }
    }
  );
  app2.delete(
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
    }
  );
  app2.post(
    "/api/admin/mahapuran-skandas",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranSkandaSchema: insertMahapuranSkandaSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertMahapuranSkandaSchema2.parse(req.body);
        const skanda = await storage.createMahapuranSkanda(validatedData);
        res.json(skanda);
      } catch (error) {
        console.error("Error creating mahapuran skanda:", error);
        res.status(400).json({ message: "Invalid mahapuran skanda data" });
      }
    }
  );
  app2.patch(
    "/api/admin/mahapuran-skandas/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const skanda = await storage.updateMahapuranSkanda(
          req.params.id,
          req.body
        );
        res.json(skanda);
      } catch (error) {
        console.error("Error updating mahapuran skanda:", error);
        res.status(500).json({ message: "Failed to update mahapuran skanda" });
      }
    }
  );
  app2.delete(
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
    }
  );
  app2.post(
    "/api/admin/mahapuran-chapters",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranChapterSchema: insertMahapuranChapterSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertMahapuranChapterSchema2.parse(req.body);
        const chapter = await storage.createMahapuranChapter(validatedData);
        res.json(chapter);
      } catch (error) {
        console.error("Error creating mahapuran chapter:", error);
        res.status(400).json({ message: "Invalid mahapuran chapter data" });
      }
    }
  );
  app2.patch(
    "/api/admin/mahapuran-chapters/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const chapter = await storage.updateMahapuranChapter(
          req.params.id,
          req.body
        );
        res.json(chapter);
      } catch (error) {
        console.error("Error updating mahapuran chapter:", error);
        res.status(500).json({ message: "Failed to update mahapuran chapter" });
      }
    }
  );
  app2.delete(
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
    }
  );
  app2.post(
    "/api/admin/mahapuran-chapters/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    async (req, res) => {
      try {
        const multer2 = await import("multer");
        const multerS32 = (await import("multer-s3")).default;
        const { S3Client: S3Client2 } = await import("@aws-sdk/client-s3");
        const s3Client = new S3Client2({
          region: process.env.S3_REGION || "us-east-1",
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
          }
        });
        const upload = multer2.default({
          storage: multerS32({
            s3: s3Client,
            bucket: process.env.S3_BUCKET_NAME,
            contentType: multerS32.AUTO_CONTENT_TYPE,
            key: (req2, file, cb) => {
              const fileName = `mahapuran-chapters/${file.originalname}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
              cb(null, fileName);
            }
          }),
          limits: { fileSize: 10 * 1024 * 1024 }
          // 10MB limit
        });
        upload.single("file")(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          try {
            const { skandaId, chapterNumber, title, summary } = req.body;
            const fileUrl = req.file.location;
            const fileType = req.file.mimetype;
            let content = "";
            const fileName = req.file.originalname.toLowerCase();
            if (fileType === "text/plain" || fileName.endsWith(".txt")) {
              const { GetObjectCommand } = await import("@aws-sdk/client-s3");
              const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: req.file.key
              });
              const response = await s3Client.send(command);
              const bodyContents = await response.Body?.transformToString();
              content = bodyContents || "Content could not be extracted";
            } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
              content = "PDF file uploaded. Click 'View File' to open the PDF document.";
            } else if (fileType === "application/msword" || fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
              content = "Word document uploaded. Click 'View File' to open the document.";
            } else {
              content = "File uploaded. Click 'View File' to open.";
            }
            const { insertMahapuranChapterSchema: insertMahapuranChapterSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
            const chapterData = {
              skandaId,
              chapterNumber: parseInt(chapterNumber),
              title,
              summary: summary || null,
              content: content.trim(),
              fileUrl,
              fileType
            };
            const validatedData = insertMahapuranChapterSchema2.parse(chapterData);
            const chapter = await storage.createMahapuranChapter(validatedData);
            res.json({
              message: "Chapter uploaded and created successfully",
              chapter
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
    }
  );
  app2.get("/api/media-favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getUserMediaFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching media favorites:", error);
      res.status(500).json({ message: "Failed to fetch media favorites" });
    }
  });
  app2.post("/api/media-favorites", isAuthenticated, async (req, res) => {
    try {
      const { insertUserMediaFavoriteSchema: insertUserMediaFavoriteSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const validatedData = insertUserMediaFavoriteSchema2.parse({
        userId: req.user.id,
        mediaId: req.body.mediaId
      });
      const favorite = await storage.addMediaFavorite(validatedData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding media favorite:", error);
      res.status(400).json({ message: "Failed to add media favorite" });
    }
  });
  app2.delete(
    "/api/media-favorites/:mediaId",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        await storage.removeMediaFavorite(userId, req.params.mediaId);
        res.json({ message: "Media favorite removed successfully" });
      } catch (error) {
        console.error("Error removing media favorite:", error);
        res.status(500).json({ message: "Failed to remove media favorite" });
      }
    }
  );
  app2.get(
    "/api/media-favorites/:mediaId/check",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const isFavorited = await storage.isMediaFavorited(
          userId,
          req.params.mediaId
        );
        res.json({ isFavorited });
      } catch (error) {
        console.error("Error checking media favorite:", error);
        res.status(500).json({ message: "Failed to check media favorite" });
      }
    }
  );
  app2.get("/api/mahapuran-pdfs", async (req, res) => {
    try {
      const pdfs = await storage.getAllMahapuranPdfs();
      res.json(pdfs);
    } catch (error) {
      console.error("Error fetching Mahapuran PDFs:", error);
      res.status(500).json({ message: "Failed to fetch Mahapuran PDFs" });
    }
  });
  app2.get("/api/mahapuran-pdfs/:id", async (req, res) => {
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
  app2.get("/api/mahapuran-pdfs/language/:languageCode", async (req, res) => {
    try {
      const pdf = await storage.getMahapuranPdfByLanguage(
        req.params.languageCode
      );
      if (!pdf) {
        return res.status(404).json({ message: "Mahapuran PDF not found for this language" });
      }
      res.json(pdf);
    } catch (error) {
      console.error("Error fetching Mahapuran PDF by language:", error);
      res.status(500).json({ message: "Failed to fetch Mahapuran PDF" });
    }
  });
  app2.post(
    "/api/mahapuran-pdfs",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertMahapuranPdfSchema: insertMahapuranPdfSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertMahapuranPdfSchema2.parse(req.body);
        const pdf = await storage.createMahapuranPdf(validatedData);
        res.json(pdf);
      } catch (error) {
        console.error("Error creating Mahapuran PDF:", error);
        res.status(400).json({ message: "Failed to create Mahapuran PDF" });
      }
    }
  );
  app2.patch(
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
    }
  );
  app2.delete(
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
    }
  );
  app2.post(
    "/api/mahapuran-pdfs/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    (req, res) => {
      req.uploadFolder = "mahapuran-pdfs";
      uploadToS3.single("pdf")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading PDF:", err);
          return res.status(400).json({ message: err.message || "Failed to upload PDF" });
        }
        try {
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const file = req.file;
          const pdfUrl = file.location;
          const pdfKey = file.key;
          const fileSize = file.size;
          res.json({
            message: "PDF uploaded successfully",
            pdfUrl,
            pdfKey,
            fileSize
          });
        } catch (error) {
          console.error("Error processing PDF upload:", error);
          res.status(500).json({ message: "Failed to process PDF upload" });
        }
      });
    }
  );
  app2.get("/api/trisandhya-pdfs", async (req, res) => {
    try {
      const pdfs = await storage.getAllTrisandhyaPdfs();
      res.json(pdfs);
    } catch (error) {
      console.error("Error fetching Trisandhya PDFs:", error);
      res.status(500).json({ message: "Failed to fetch Trisandhya PDFs" });
    }
  });
  app2.get("/api/trisandhya-pdfs/:id", async (req, res) => {
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
  app2.post(
    "/api/trisandhya-pdfs",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertTrisandhyaPdfSchema: insertTrisandhyaPdfSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertTrisandhyaPdfSchema2.parse(req.body);
        const pdf = await storage.createTrisandhyaPdf(validatedData);
        res.json(pdf);
      } catch (error) {
        console.error("Error creating Trisandhya PDF:", error);
        res.status(400).json({ message: "Failed to create Trisandhya PDF" });
      }
    }
  );
  app2.patch(
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
    }
  );
  app2.delete(
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
    }
  );
  app2.post(
    "/api/trisandhya-pdfs/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    (req, res) => {
      req.uploadFolder = "trisandhya-pdfs";
      uploadToS3.single("pdf")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading PDF:", err);
          return res.status(400).json({ message: err.message || "Failed to upload PDF" });
        }
        try {
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const file = req.file;
          const pdfUrl = file.location;
          const pdfKey = file.key;
          const fileSize = file.size;
          res.json({
            message: "PDF uploaded successfully",
            pdfUrl,
            pdfKey,
            fileSize
          });
        } catch (error) {
          console.error("Error processing PDF upload:", error);
          res.status(500).json({ message: "Failed to process PDF upload" });
        }
      });
    }
  );
  app2.get("/api/scripture-pdfs", async (req, res) => {
    try {
      const pdfs = await storage.getAllScripturePdfs();
      res.json(pdfs);
    } catch (error) {
      console.error("Error fetching Scripture PDFs:", error);
      res.status(500).json({ message: "Failed to fetch Scripture PDFs" });
    }
  });
  app2.get("/api/scripture-pdfs/:id", async (req, res) => {
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
  app2.post(
    "/api/scripture-pdfs",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertScripturePdfSchema: insertScripturePdfSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertScripturePdfSchema2.parse(req.body);
        const pdf = await storage.createScripturePdf(validatedData);
        res.json(pdf);
      } catch (error) {
        console.error("Error creating Scripture PDF:", error);
        res.status(400).json({ message: "Failed to create Scripture PDF" });
      }
    }
  );
  app2.patch(
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
    }
  );
  app2.delete(
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
    }
  );
  app2.post(
    "/api/scripture-pdfs/upload",
    isAuthenticated,
    isAdmin,
    fileUploadRateLimiter.middleware(),
    (req, res) => {
      req.uploadFolder = "scripture-pdfs";
      uploadToS3.single("pdf")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading PDF:", err);
          return res.status(400).json({ message: err.message || "Failed to upload PDF" });
        }
        try {
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const file = req.file;
          const pdfUrl = file.location;
          const pdfKey = file.key;
          const fileSize = file.size;
          res.json({
            message: "PDF uploaded successfully",
            pdfUrl,
            pdfKey,
            fileSize
          });
        } catch (error) {
          console.error("Error processing PDF upload:", error);
          res.status(500).json({ message: "Failed to process PDF upload" });
        }
      });
    }
  );
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications2 = await storage.getUserNotifications(userId, 50);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.get(
    "/api/notifications/unread-count",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const count = await storage.getUnreadNotificationCount(userId);
        res.json({ count });
      } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
      }
    }
  );
  app2.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.markNotificationAsRead(userId, req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  app2.get(
    "/api/admin/notifications",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const notifications2 = await storage.getAllNotifications();
        res.json(notifications2);
      } catch (error) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
      }
    }
  );
  app2.post(
    "/api/admin/notifications",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertNotificationSchema: insertNotificationSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertNotificationSchema2.parse(req.body);
        const notification = await storage.createNotification(validatedData);
        if (validatedData.sendToAll) {
          const users2 = await storage.getAllUsers();
          for (const user of users2) {
            await storage.createNotificationReceipt({
              notificationId: notification.id,
              userId: user.id
            });
            if (app2.broadcastNotification) {
              app2.broadcastNotification(user.id, {
                notification,
                receipt: {
                  notificationId: notification.id,
                  userId: user.id,
                  isRead: false
                }
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
    }
  );
  app2.delete(
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
    }
  );
  app2.get(
    "/api/notification-preferences",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        let prefs = await storage.getNotificationPreferences(userId);
        if (!prefs) {
          prefs = await storage.createNotificationPreferences({
            userId,
            pushEnabled: true,
            inAppEnabled: true,
            emailEnabled: false
          });
        }
        res.json(prefs);
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        res.status(500).json({ message: "Failed to fetch notification preferences" });
      }
    }
  );
  app2.patch(
    "/api/notification-preferences",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const prefs = await storage.updateNotificationPreferences(
          userId,
          req.body
        );
        res.json(prefs);
      } catch (error) {
        console.error("Error updating notification preferences:", error);
        res.status(400).json({ message: "Failed to update notification preferences" });
      }
    }
  );
  app2.post("/api/push-subscriptions", isAuthenticated, async (req, res) => {
    try {
      const { insertPushSubscriptionSchema: insertPushSubscriptionSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const validatedData = insertPushSubscriptionSchema2.parse({
        userId: req.user.id,
        ...req.body
      });
      const subscription = await storage.createPushSubscription(validatedData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating push subscription:", error);
      res.status(400).json({ message: "Failed to create push subscription" });
    }
  });
  app2.delete("/api/push-subscriptions", isAuthenticated, async (req, res) => {
    try {
      const { endpoint } = req.body;
      await storage.deletePushSubscription(endpoint);
      res.json({ message: "Push subscription deleted successfully" });
    } catch (error) {
      console.error("Error deleting push subscription:", error);
      res.status(500).json({ message: "Failed to delete push subscription" });
    }
  });
  app2.get("/api/notification-sounds", isAuthenticated, async (req, res) => {
    try {
      const sounds = await storage.getAllNotificationSounds();
      res.json(sounds);
    } catch (error) {
      console.error("Error fetching notification sounds:", error);
      res.status(500).json({ message: "Failed to fetch notification sounds" });
    }
  });
  app2.post(
    "/api/notification-sounds",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { insertNotificationSoundSchema: insertNotificationSoundSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const validatedData = insertNotificationSoundSchema2.parse(req.body);
        const sound = await storage.createNotificationSound(validatedData);
        res.json(sound);
      } catch (error) {
        console.error("Error creating notification sound:", error);
        res.status(400).json({ message: "Failed to create notification sound" });
      }
    }
  );
  const httpServer = createServer(app2);
  const { WebSocketServer } = await import("ws");
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/notifications"
  });
  const notificationClients = /* @__PURE__ */ new Map();
  wss.on("connection", (ws2, req) => {
    let userId = null;
    ws2.on("message", async (message) => {
      try {
        const rawMessage = message.toString();
        if (rawMessage.length > 1e4) {
          ws2.send(JSON.stringify({ type: "error", message: "Message too large" }));
          return;
        }
        const data = JSON.parse(rawMessage);
        if (typeof data !== "object" || !data.type) {
          ws2.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
          return;
        }
        if (data.type === "authenticate" && data.userId) {
          if (typeof data.userId !== "string" || data.userId.length > 100) {
            ws2.send(JSON.stringify({ type: "error", message: "Invalid userId" }));
            return;
          }
          userId = data.userId;
          if (!notificationClients.has(userId)) {
            notificationClients.set(userId, /* @__PURE__ */ new Set());
          }
          notificationClients.get(userId)?.add(ws2);
          console.log(`[WS] User ${userId} connected for notifications`);
          ws2.send(JSON.stringify({ type: "authenticated", userId }));
        }
      } catch (error) {
        console.error("[WS] Error processing message:", error);
        ws2.send(JSON.stringify({ type: "error", message: "Failed to process message" }));
      }
    });
    ws2.on("close", () => {
      if (userId && notificationClients.has(userId)) {
        notificationClients.get(userId).delete(ws2);
        if (notificationClients.get(userId).size === 0) {
          notificationClients.delete(userId);
        }
        console.log(`[WS] User ${userId} disconnected from notifications`);
      }
    });
    ws2.on("error", (error) => {
      console.error("[WS] WebSocket error:", error);
    });
  });
  app2.broadcastNotification = (userId, notification) => {
    if (notificationClients.has(userId)) {
      const clients = notificationClients.get(userId);
      const message = JSON.stringify({
        type: "new_notification",
        notification
      });
      clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }
  };
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    hmr: process.env.REPL_ID ? {
      protocol: "wss",
      clientPort: 443
    } : true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const hmrConfig = process.env.REPL_ID ? {
    protocol: "wss",
    host: process.env.REPLIT_DOMAINS?.split(",")[0] || void 0,
    clientPort: 443,
    server
  } : { server };
  const serverOptions = {
    middlewareMode: true,
    hmr: hmrConfig,
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.get("/alarm-sw.js", async (req, res) => {
    const swPath = path3.resolve(import.meta.dirname, "..", "public", "alarm-sw.js");
    res.type("application/javascript");
    const content = await fs.promises.readFile(swPath, "utf-8");
    res.send(content);
  });
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/seedAdmin.ts
import bcrypt3 from "bcrypt";
init_schema();
import { eq as eq2 } from "drizzle-orm";
async function seedAdmin() {
  try {
    const adminEmailsString = process.env.ADMIN_EMAILS || "";
    const adminEmails = adminEmailsString.split(",").map((email) => email.trim()).filter((email) => email);
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn("\u26A0\uFE0F  ADMIN_PASSWORD environment variable not set. Admin users will not be created.");
      console.warn("   Set ADMIN_PASSWORD in your environment to create admin users.");
      return;
    }
    if (adminEmails.length === 0) {
      console.warn("\u26A0\uFE0F  ADMIN_EMAILS environment variable not set. Admin users will not be created.");
      console.warn("   Set ADMIN_EMAILS (comma-separated) in your environment to create admin users.");
      return;
    }
    for (const adminEmail of adminEmails) {
      const existingAdmin = await storage.getUserByEmail(adminEmail);
      if (existingAdmin) {
        console.log(`\u2705 Admin user already exists: ${adminEmail}`);
        if (!existingAdmin.isAdmin || !existingAdmin.emailVerified) {
          await storage.updateUserAdminStatus(existingAdmin.id, true);
          if (!existingAdmin.emailVerified) {
            await db.update(users).set({ emailVerified: true, firstName: "Admin", lastName: "User" }).where(eq2(users.id, existingAdmin.id));
            console.log(`   Updated ${adminEmail} to admin status and verified email`);
          } else {
            console.log(`   Updated ${adminEmail} to admin status`);
          }
        }
        continue;
      }
      const hashedPassword = await bcrypt3.hash(adminPassword, 10);
      const admin = await storage.createLocalUser({
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        emailVerified: true,
        isAdmin: true,
        verificationToken: null
      });
      console.log(`\u2705 Admin user created successfully: ${adminEmail}`);
      console.log("   Password: [CONFIGURED VIA ENVIRONMENT]");
    }
  } catch (error) {
    console.error("\u274C Error seeding admin user:", error);
  }
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(logger.middleware());
(async () => {
  const server = await registerRoutes(app);
  await seedAdmin();
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const isWindows = process.platform === "win32";
  const listenOptions = {
    port,
    host: isWindows ? "127.0.0.1" : "0.0.0.0",
    ...isWindows ? {} : { reusePort: true }
  };
  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
