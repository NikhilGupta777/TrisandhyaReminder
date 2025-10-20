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
  date,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
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
  lastLogin: timestamp("last_login"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const registerUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export const verifyCodeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export type VerifyCode = z.infer<typeof verifyCodeSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "Reset code must be 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

// Alarm settings for each user
export const alarmSettings = pgTable("alarm_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  pratahEnabled: boolean("pratah_enabled").default(true).notNull(),
  pratahTime: varchar("pratah_time", { length: 5 }).default("05:30").notNull(), // HH:MM format
  madhyahnaEnabled: boolean("madhyahna_enabled").default(true).notNull(),
  madhyahnaTime: varchar("madhyahna_time", { length: 5 }).default("12:00").notNull(), // HH:MM format
  sayamEnabled: boolean("sayam_enabled").default(true).notNull(),
  sayamTime: varchar("sayam_time", { length: 5 }).default("18:00").notNull(), // HH:MM format
  alarmSoundId: varchar("alarm_sound_id").references(() => alarmSounds.id),
  volume: integer("volume").default(80).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAlarmSettingsSchema = createInsertSchema(alarmSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAlarmSettings = z.infer<typeof insertAlarmSettingsSchema>;
export type AlarmSettings = typeof alarmSettings.$inferSelect;

// Daily sadhana progress
export const sadhanaProgress = pgTable("sadhana_progress", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSadhanaProgressSchema = createInsertSchema(sadhanaProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSadhanaProgress = z.infer<typeof insertSadhanaProgressSchema>;
export type SadhanaProgress = typeof sadhanaProgress.$inferSelect;

// Media categories (dynamic categories like Bhajan, Pravachan, Katha, etc.)
export const mediaCategories = pgTable("media_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMediaCategorySchema = createInsertSchema(mediaCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMediaCategory = z.infer<typeof insertMediaCategorySchema>;
export type MediaCategory = typeof mediaCategories.$inferSelect;

// Media content (bhajans, pravachans, kathas, etc.)
export const mediaContent = pgTable("media_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: varchar("category_id").references(() => mediaCategories.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'audio', 'video', 'youtube'
  artist: varchar("artist", { length: 255 }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: varchar("duration", { length: 20 }),
  description: text("description"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMediaContentSchema = createInsertSchema(mediaContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMediaContent = z.infer<typeof insertMediaContentSchema>;
export type MediaContent = typeof mediaContent.$inferSelect;

// Scripture content (for Mahapuran Path) - legacy table, kept for backward compatibility
export const scriptureContent = pgTable("scripture_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterNumber: integer("chapter_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertScriptureContentSchema = createInsertSchema(scriptureContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScriptureContent = z.infer<typeof insertScriptureContentSchema>;
export type ScriptureContent = typeof scriptureContent.$inferSelect;

// Mahapuran titles (e.g., "Bhagwat Mahapuran - EN", "Bhagwat Mahapuran - HIN")
export const mahapuranTitles = pgTable("mahapuran_titles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  language: varchar("language", { length: 10 }).notNull(), // 'en', 'hin', etc.
  languageName: varchar("language_name", { length: 100 }), // 'English', 'Hindi', etc.
  description: text("description"),
  collectionType: varchar("collection_type", { length: 20 }).default("mahapuran").notNull(), // 'mahapuran' | 'other'
  totalSkandas: integer("total_skandas").default(12).notNull(),
  totalChapters: integer("total_chapters"),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMahapuranTitleSchema = createInsertSchema(mahapuranTitles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMahapuranTitle = z.infer<typeof insertMahapuranTitleSchema>;
export type MahapuranTitle = typeof mahapuranTitles.$inferSelect;

// Mahapuran skandas (volumes/books within a Mahapuran)
export const mahapuranSkandas = pgTable("mahapuran_skandas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mahapuranTitleId: varchar("mahapuran_title_id").references(() => mahapuranTitles.id, { onDelete: "cascade" }).notNull(),
  skandaNumber: integer("skanda_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMahapuranSkandaSchema = createInsertSchema(mahapuranSkandas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMahapuranSkanda = z.infer<typeof insertMahapuranSkandaSchema>;
export type MahapuranSkanda = typeof mahapuranSkandas.$inferSelect;

// Mahapuran chapters (individual chapters within a skanda)
export const mahapuranChapters = pgTable("mahapuran_chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  skandaId: varchar("skanda_id").references(() => mahapuranSkandas.id, { onDelete: "cascade" }).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  fileUrl: varchar("file_url", { length: 500 }),
  fileType: varchar("file_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMahapuranChapterSchema = createInsertSchema(mahapuranChapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMahapuranChapter = z.infer<typeof insertMahapuranChapterSchema>;
export type MahapuranChapter = typeof mahapuranChapters.$inferSelect;

// User favorites for media content
export const userMediaFavorites = pgTable("user_media_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  mediaId: varchar("media_id").references(() => mediaContent.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserMediaFavoriteSchema = createInsertSchema(userMediaFavorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUserMediaFavorite = z.infer<typeof insertUserMediaFavoriteSchema>;
export type UserMediaFavorite = typeof userMediaFavorites.$inferSelect;

// Sadhana Guide content (mantras, prayers, instructions)
export const sadhanaContent = pgTable("sadhana_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category", { length: 50 }).notNull(), // 'trisandhya', 'mahapuran', 'jap', 'timing'
  sectionTitle: varchar("section_title", { length: 255 }).notNull(),
  orderNumber: integer("order_number").notNull(),
  sanskritText: text("sanskrit_text"),
  englishTranslation: text("english_translation"),
  description: text("description"),
  repeatCount: varchar("repeat_count", { length: 50 }), // e.g., "3 times", "7 times"
  contentType: varchar("content_type", { length: 50 }), // 'mantra', 'stotram', 'prayer', 'instruction', 'timing'
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSadhanaContentSchema = createInsertSchema(sadhanaContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSadhanaContent = z.infer<typeof insertSadhanaContentSchema>;
export type SadhanaContent = typeof sadhanaContent.$inferSelect;

// Alarm sounds library
export const alarmSounds = pgTable("alarm_sounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  duration: integer("duration"),
  description: text("description"),
  isDefault: boolean("is_default").default(false).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAlarmSoundSchema = createInsertSchema(alarmSounds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAlarmSound = z.infer<typeof insertAlarmSoundSchema>;
export type AlarmSound = typeof alarmSounds.$inferSelect;

// Japa audios library (for meditation/japa counter)
export const japaAudios = pgTable("japa_audios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  duration: integer("duration"),
  description: text("description"),
  isDefault: boolean("is_default").default(false).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJapaAudioSchema = createInsertSchema(japaAudios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJapaAudio = z.infer<typeof insertJapaAudioSchema>;
export type JapaAudio = typeof japaAudios.$inferSelect;

// Japa settings for each user
export const japaSettings = pgTable("japa_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  japaAudioId: varchar("japa_audio_id").references(() => japaAudios.id),
  hapticEnabled: boolean("haptic_enabled").default(false).notNull(),
  soundEnabled: boolean("sound_enabled").default(true).notNull(),
  dailyGoal: integer("daily_goal").default(108).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJapaSettingsSchema = createInsertSchema(japaSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJapaSettings = z.infer<typeof insertJapaSettingsSchema>;
export type JapaSettings = typeof japaSettings.$inferSelect;

// Registration attempts tracking for rate limiting
export const registrationAttempts = pgTable("registration_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

export type RegistrationAttempt = typeof registrationAttempts.$inferSelect;

// Mahapuran PDFs for downloading full Mahapuran by language
export const mahapuranPdfs = pgTable("mahapuran_pdfs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  languageCode: varchar("language_code", { length: 10 }).notNull(), // 'en', 'hin', 'ben', etc.
  languageName: varchar("language_name", { length: 100 }).notNull(), // 'English', 'Hindi', 'Bengali'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  heroImageUrl: text("hero_image_url"),
  pdfUrl: text("pdf_url"), // S3 URL for the PDF
  pdfKey: varchar("pdf_key", { length: 500 }), // S3 key for deletion
  fileSize: integer("file_size"), // in bytes
  totalSkandas: integer("total_skandas").default(12).notNull(),
  totalChapters: integer("total_chapters"),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMahapuranPdfSchema = createInsertSchema(mahapuranPdfs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMahapuranPdf = z.infer<typeof insertMahapuranPdfSchema>;
export type MahapuranPdf = typeof mahapuranPdfs.$inferSelect;

// Trisandhya Path PDFs for different languages
export const trisandhyaPdfs = pgTable("trisandhya_pdfs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  languageCode: varchar("language_code", { length: 10 }).notNull(), // 'en', 'hin', 'ori', etc.
  languageName: varchar("language_name", { length: 100 }).notNull(), // 'English', 'Hindi', 'Odia'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pdfUrl: text("pdf_url"), // S3 URL for the PDF
  pdfKey: varchar("pdf_key", { length: 500 }), // S3 key for deletion
  fileSize: integer("file_size"), // in bytes
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrisandhyaPdfSchema = createInsertSchema(trisandhyaPdfs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTrisandhyaPdf = z.infer<typeof insertTrisandhyaPdfSchema>;
export type TrisandhyaPdf = typeof trisandhyaPdfs.$inferSelect;

// Scripture PDFs for different languages
export const scripturePdfs = pgTable("scripture_pdfs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  languageCode: varchar("language_code", { length: 10 }).notNull(), // 'en', 'hin', 'san', etc.
  languageName: varchar("language_name", { length: 100 }).notNull(), // 'English', 'Hindi', 'Sanskrit'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pdfUrl: text("pdf_url"), // S3 URL for the PDF
  pdfKey: varchar("pdf_key", { length: 500 }), // S3 key for deletion
  fileSize: integer("file_size"), // in bytes
  totalSkandas: integer("total_skandas"), // Total books/sections
  totalChapters: integer("total_chapters"), // Total chapters
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertScripturePdfSchema = createInsertSchema(scripturePdfs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScripturePdf = z.infer<typeof insertScripturePdfSchema>;
export type ScripturePdf = typeof scripturePdfs.$inferSelect;

// Notification sounds library
export const notificationSounds = pgTable("notification_sounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  duration: integer("duration"),
  description: text("description"),
  isDefault: boolean("is_default").default(false).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationSoundSchema = createInsertSchema(notificationSounds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationSound = z.infer<typeof insertNotificationSoundSchema>;
export type NotificationSound = typeof notificationSounds.$inferSelect;

// Notifications table for in-app and push notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'content_update', 'announcement', 'feature', 'media_added', etc.
  category: varchar("category", { length: 100 }), // 'media', 'scripture', 'sadhana', 'general'
  targetUrl: varchar("target_url", { length: 500 }), // URL to navigate when notification is clicked
  imageUrl: text("image_url"), // Optional image for rich notifications
  soundId: varchar("sound_id").references(() => notificationSounds.id),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(), // 'low', 'normal', 'high'
  sendToAll: boolean("send_to_all").default(false).notNull(), // If true, send to all users
  scheduledFor: timestamp("scheduled_for"), // For scheduled notifications
  sentAt: timestamp("sent_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // When notification should no longer be shown
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Notification receipts - tracks which users have seen which notifications
export const notificationReceipts = pgTable("notification_receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationId: varchar("notification_id").references(() => notifications.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  deliveredAt: timestamp("delivered_at").defaultNow(),
  clicked: boolean("clicked").default(false).notNull(),
  clickedAt: timestamp("clicked_at"),
});

export const insertNotificationReceiptSchema = createInsertSchema(notificationReceipts).omit({
  id: true,
  deliveredAt: true,
});

export type InsertNotificationReceipt = z.infer<typeof insertNotificationReceiptSchema>;
export type NotificationReceipt = typeof notificationReceipts.$inferSelect;

// User notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Push notification subscriptions for web push
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  endpoint: text("endpoint").notNull().unique(),
  keys: jsonb("keys").notNull(), // Contains p256dh and auth keys
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;

// Mobile alarm backups for optional cloud sync
export const mobileAlarms = pgTable("mobile_alarms", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  time: varchar("time", { length: 5 }).notNull(), // HH:MM format
  enabled: boolean("enabled").default(true).notNull(),
  repeatDays: text("repeat_days").notNull(), // JSON array
  toneName: varchar("tone_name", { length: 255 }).notNull(),
  toneUri: text("tone_uri"),
  volume: integer("volume").default(80).notNull(),
  vibrate: boolean("vibrate").default(true).notNull(),
  snoozeMinutes: integer("snooze_minutes").default(5).notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMobileAlarmSchema = createInsertSchema(mobileAlarms).omit({
  createdAt: true,
  lastSyncedAt: true,
});

export type InsertMobileAlarm = z.infer<typeof insertMobileAlarmSchema>;
export type MobileAlarm = typeof mobileAlarms.$inferSelect;
