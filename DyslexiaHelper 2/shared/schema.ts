import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User preferences table for storing accessibility settings
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  theme: text("theme").notNull().default('light'),
  fontFamily: text("font_family").notNull().default('roboto'),
  fontSize: integer("font_size").notNull().default(16),
  letterSpacing: integer("letter_spacing").notNull().default(1),
  lineHeight: integer("line_height").notNull().default(15),
  customSettings: jsonb("custom_settings"),
});

// Keep the users table from the original schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  theme: true,
  fontFamily: true,
  fontSize: true,
  letterSpacing: true,
  lineHeight: true,
  customSettings: true,
}).partial({
  theme: true,
  fontFamily: true,
  fontSize: true,
  letterSpacing: true,
  lineHeight: true,
  customSettings: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertPreferencesSchema>;
