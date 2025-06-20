import { users, tasks, taskMessages, type User, type InsertUser, type Task, type InsertTask, type TaskMessage, type InsertTaskMessage } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getAllTasks(): Promise<Task[]>;
  getAllTasksIncludingDeleted(): Promise<Task[]>;
  getTaskByTaskId(taskId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  permanentDeleteTask(taskId: string): Promise<void>;
  
  // Task message methods
  getTaskMessages(taskId: string): Promise<TaskMessage[]>;
  createTaskMessage(message: InsertTaskMessage): Promise<TaskMessage>;
  
  // Work records methods
  getWorkRecords(): Promise<Task[]>;
}

import { db } from "./db";
import { eq, desc, isNull, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(sql`${tasks.deletedAt} IS NULL`)
      .orderBy(desc(tasks.createdAt));
  }

  async getAllTasksIncludingDeleted(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTaskByTaskId(taskId: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.taskId, taskId)).limit(1);
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    // Build the update object carefully, excluding undefined values and handling nulls properly
    const updateData: any = { updatedAt: new Date() };
    
    // Only include fields that are explicitly provided in updates
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    
    const result = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.taskId, taskId))
      .returning();
    
    if (!result || result.length === 0) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    return result[0];
  }

  async deleteTask(taskId: string): Promise<void> {
    // Soft delete: set deletedAt timestamp and deletedBy
    await db.update(tasks)
      .set({ 
        deletedAt: new Date().toISOString(),
        deletedBy: 'system' // TODO: get actual user when auth is implemented
      })
      .where(eq(tasks.taskId, taskId));
  }

  async permanentDeleteTask(taskId: string): Promise<void> {
    // Hard delete: permanently remove from database
    await db.delete(tasks).where(eq(tasks.taskId, taskId));
  }

  // Task message methods
  async getTaskMessages(taskId: string): Promise<TaskMessage[]> {
    return await db.select().from(taskMessages)
      .where(eq(taskMessages.taskId, taskId))
      .orderBy(taskMessages.createdAt);
  }

  async createTaskMessage(message: InsertTaskMessage): Promise<TaskMessage> {
    const result = await db.insert(taskMessages).values(message).returning();
    return result[0];
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<string, Task>;
  private messages: Map<string, TaskMessage[]>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.messages = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => !task.deletedAt)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async getAllTasksIncludingDeleted(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTaskByTaskId(taskId: string): Promise<Task | undefined> {
    return this.tasks.get(taskId);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const now = new Date();
    const newTask: Task = {
      ...task,
      id: this.currentId++,
      createdAt: now,
      updatedAt: now,
      // Ensure all fields are properly typed
      project: task.project ?? null,
      estimatedCompletion: task.estimatedCompletion ?? null,
      dateCreated: task.dateCreated ?? null,
      dueDate: task.dueDate ?? null,
      assignee: task.assignee ?? null,
      hasAttachment: task.hasAttachment ?? false,
      collaborators: task.collaborators ?? [],
      status: task.status ?? null,
      archived: task.archived ?? false,
      deletedAt: task.deletedAt ?? null,
      deletedBy: task.deletedBy ?? null,
      description: task.description ?? null,
    };
    this.tasks.set(task.taskId, newTask);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const existing = this.tasks.get(taskId);
    if (!existing) throw new Error(`Task ${taskId} not found`);
    
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(taskId, updated);
    return updated;
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      const updatedTask: Task = {
        ...task,
        deletedAt: new Date().toISOString(),
        deletedBy: 'system',
        updatedAt: new Date()
      };
      this.tasks.set(taskId, updatedTask);
    }
  }

  async permanentDeleteTask(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
    this.messages.delete(taskId);
  }

  async getTaskMessages(taskId: string): Promise<TaskMessage[]> {
    return this.messages.get(taskId) || [];
  }

  async createTaskMessage(message: InsertTaskMessage): Promise<TaskMessage> {
    const now = new Date();
    const newMessage: TaskMessage = {
      ...message,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    const existing = this.messages.get(message.taskId) || [];
    existing.push(newMessage);
    this.messages.set(message.taskId, existing);
    
    return newMessage;
  }

  async getWorkRecords(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.workRecord === true);
  }
}

// Use DatabaseStorage by default, fallback to MemStorage if needed
export const storage = new DatabaseStorage();
