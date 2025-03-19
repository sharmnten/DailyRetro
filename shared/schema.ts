import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'pacman', 'space-invaders', 'frogger', etc.
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  date: text("date").notNull(), // Date in "YYYY-MM-DD" format
  icon: text("icon").notNull(), // Font Awesome icon string
  parameters: text("parameters").notNull().default('{}'), // JSON string of GameParameters
  variationId: integer("variation_id").default(0), // Unique identifier for this specific variation
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  date: text("date").notNull(), // Date in "YYYY-MM-DD" format
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
  timestamp: true,
});

export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;

// Game variation parameters
export interface GameParameters {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  speedMultiplier: number;
  enemyCount: number;
  specialFeatures: string[];
  layoutSeed: number;
  timeLimit?: number;
  livesCount: number;
  bonusFrequency: number;
  customColors?: Record<string, string>;
  themeId?: number;
}

// Game variation/challenge
export interface GameVariation {
  id: number;
  gameType: string;
  name: string;
  description: string;
  parameters: GameParameters;
  dateCreated: string;
}
