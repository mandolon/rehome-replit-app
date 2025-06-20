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
  timeLogged: text("time_logged").default("0"),
  workRecord: boolean("work_record").default(false),
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

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("in_progress"), // 'in_progress', 'on_hold', 'completed'
  clientName: text("client_name"),
  projectAddress: text("project_address"),
  startDate: text("start_date"),
  dueDate: text("due_date"),
  estimatedCompletion: text("estimated_completion"),
  priority: text("priority").default("medium"), // 'low', 'medium', 'high'
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: text("deleted_at"),
  deletedBy: text("deleted_by"),
});

export const trashItems = pgTable("trash_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemType: text("item_type").notNull(), // 'task', 'note', 'project', etc.
  itemId: text("item_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Store type-specific data
  deletedBy: text("deleted_by").notNull(),
  deletedAt: timestamp("deleted_at").defaultNow().notNull(),
  originalData: jsonb("original_data").notNull(), // Store full original object for restoration
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

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrashItemSchema = createInsertSchema(trashItems).omit({
  id: true,
  deletedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskMessage = typeof taskMessages.$inferSelect;
export type InsertTaskMessage = z.infer<typeof insertTaskMessageSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type TrashItem = typeof trashItems.$inferSelect;
export type InsertTrashItem = z.infer<typeof insertTrashItemSchema>;
