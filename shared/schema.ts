import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const githubConfigs = pgTable("github_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  githubToken: text("github_token").notNull(),
  githubUsername: text("github_username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  language: text("language"),
  description: text("description"),
  repositoryName: text("repository_name"),
  githubUrl: text("github_url"),
  syncStatus: text("sync_status").notNull().default("pending"), // pending, syncing, synced, error
  syncProgress: text("sync_progress").default("0"),
  isPrivate: boolean("is_private").default(false),
  autoSync: boolean("auto_sync").default(false),
  lastModified: timestamp("last_modified").defaultNow(),
  lastSynced: timestamp("last_synced"),
  errorMessage: text("error_message"),
  replitId: text("replit_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGithubConfigSchema = createInsertSchema(githubConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  lastModified: true,
  lastSynced: true,
});

export const updateProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  lastModified: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GithubConfig = typeof githubConfigs.$inferSelect;
export type InsertGithubConfig = z.infer<typeof insertGithubConfigSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
