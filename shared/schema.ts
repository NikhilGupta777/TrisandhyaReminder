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
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Alarm settings for each user
export const alarmSettings = pgTable("alarm_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  pratahEnabled: boolean("pratah_enabled").default(true).notNull(),
  madhyahnaEnabled: boolean("madhyahna_enabled").default(true).notNull(),
  sayamEnabled: boolean("sayam_enabled").default(true).notNull(),
  soundType: varchar("sound_type", { length: 20 }).default("bell").notNull(),
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

// Media content (bhajans, pravachans)
export const mediaContent = pgTable("media_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'bhajan' or 'pravachan'
  artist: varchar("artist", { length: 255 }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: varchar("duration", { length: 20 }),
  description: text("description"),
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

// Scripture content (for Mahapuran Path)
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
