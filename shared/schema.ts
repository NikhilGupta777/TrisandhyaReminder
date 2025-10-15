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
  madhyahnaEnabled: boolean("madhyahna_enabled").default(true).notNull(),
  sayamEnabled: boolean("sayam_enabled").default(true).notNull(),
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
  description: text("description"),
  totalSkandas: integer("total_skandas").default(12).notNull(),
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
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
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
