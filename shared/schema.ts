import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull().unique(),
  title: text("title").notNull(),
  projectId: text("project_id").notNull(),
  project: text("project"),
  estimatedCompletion: text("estimated_completion"),
  dateCreated: text("date_created"),
  dueDate: text("due_date"),
  assignee: jsonb("assignee"),
  hasAttachment: boolean("has_attachment").default(false),
  collaborators: jsonb("collaborators").default('[]'),
  status: text("status"),
  archived: boolean("archived").default(false),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: text("deleted_at"),
  deletedBy: text("deleted_by"),
  description: text("description"),
  markedComplete: timestamp("marked_complete"),
  markedCompleteBy: text("marked_complete_by"),
});

export const taskMessages = pgTable("task_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: text("task_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskMessageSchema = createInsertSchema(taskMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskMessage = typeof taskMessages.$inferSelect;
export type InsertTaskMessage = z.infer<typeof insertTaskMessageSchema>;
