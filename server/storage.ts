import { users, tasks, taskMessages, projects, trashItems, type User, type InsertUser, type Task, type InsertTask, type TaskMessage, type InsertTaskMessage, type Project, type InsertProject, type TrashItem, type InsertTrashItem } from "@shared/schema";

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
  
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProjectByProjectId(projectId: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(projectId: string, updates: Partial<Project>): Promise<Project>;
  updateProjectStatus(projectId: string, status: 'in_progress' | 'on_hold' | 'completed'): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
  permanentDeleteProject(projectId: string): Promise<void>;
  
  // Work records methods
  getWorkRecords(): Promise<Task[]>;
  
  // Trash methods
  getAllTrashItems(): Promise<TrashItem[]>;
  moveToTrash(itemType: string, itemId: string, title: string, description: string, metadata: any, originalData: any, deletedBy: string): Promise<TrashItem>;
  restoreFromTrash(trashItemId: string): Promise<void>;
  permanentDeleteFromTrash(trashItemId: string): Promise<void>;
  emptyTrash(): Promise<void>;
  
  // Search methods
  searchAll(query: string): Promise<{
    people: User[];
    projects: Project[];
    tasks: Task[];
    files: any[];
    notes: any[];
  }>;
}

import { db } from "./db";
import { eq, desc, isNull, sql, like, or, ilike } from "drizzle-orm";

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
    // Get the task first to store in trash
    const task = await this.getTaskByTaskId(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Move to universal trash system
    await this.moveToTrash(
      'task',
      taskId,
      task.title,
      task.description || '',
      { project: task.project, status: task.status },
      task,
      'system' // TODO: get actual user when auth is implemented
    );

    // Hard delete from tasks table since it's now in trash
    await db.delete(tasks).where(eq(tasks.taskId, taskId));
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

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects)
      .where(sql`${projects.deletedAt} IS NULL`)
      .orderBy(desc(projects.createdAt));
  }

  async getProjectByProjectId(projectId: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.projectId, projectId)).limit(1);
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const result = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.projectId, projectId))
      .returning();
    
    if (!result || result.length === 0) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    return result[0];
  }

  async updateProjectStatus(projectId: string, status: 'in_progress' | 'on_hold' | 'completed'): Promise<Project> {
    const result = await db.update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.projectId, projectId))
      .returning();
    
    if (!result || result.length === 0) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    return result[0];
  }

  async deleteProject(projectId: string): Promise<void> {
    // Get the project first to store in trash
    const project = await this.getProjectByProjectId(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Count associated tasks
    const taskCount = await db.select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    // Move to universal trash system
    await this.moveToTrash(
      'project',
      projectId,
      project.title,
      project.description || '',
      { 
        clientName: project.clientName,
        status: project.status,
        taskCount: taskCount[0]?.count || 0
      },
      project,
      'system' // TODO: get actual user when auth is implemented
    );

    // Hard delete from projects table since it's now in trash
    await db.delete(projects).where(eq(projects.projectId, projectId));
  }

  async permanentDeleteProject(projectId: string): Promise<void> {
    // Hard delete: permanently remove from database
    await db.delete(projects).where(eq(projects.projectId, projectId));
  }

  async getWorkRecords(): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workRecord, true))
      .orderBy(desc(tasks.updatedAt));
    return result;
  }

  // Trash methods
  async getAllTrashItems(): Promise<TrashItem[]> {
    return await db.select().from(trashItems)
      .orderBy(desc(trashItems.deletedAt));
  }

  async moveToTrash(itemType: string, itemId: string, title: string, description: string, metadata: any, originalData: any, deletedBy: string): Promise<TrashItem> {
    const trashItem: InsertTrashItem = {
      itemType,
      itemId,
      title,
      description,
      metadata,
      originalData,
      deletedBy
    };
    
    const result = await db.insert(trashItems).values(trashItem).returning();
    return result[0];
  }

  async restoreFromTrash(trashItemId: string): Promise<void> {
    // Get the trash item
    const trashItem = await db.select().from(trashItems)
      .where(eq(trashItems.id, trashItemId))
      .limit(1);
    
    if (!trashItem || trashItem.length === 0) {
      throw new Error(`Trash item with ID ${trashItemId} not found`);
    }

    const item = trashItem[0];
    
    // Restore based on item type
    if (item.itemType === 'task') {
      const originalTask = item.originalData as Task;
      // Remove the item from task's deletedAt field
      await db.update(tasks)
        .set({ 
          deletedAt: null,
          deletedBy: null 
        })
        .where(eq(tasks.taskId, item.itemId));
    } else if (item.itemType === 'project') {
      const originalProject = item.originalData as Project;
      // Re-insert the project back into the projects table
      await db.insert(projects).values({
        ...originalProject,
        deletedAt: null,
        deletedBy: null
      });
    } else if (item.itemType === 'note') {
      // Notes are handled client-side only for now
      // The restoration will be handled by the frontend note system
      console.log(`Note ${item.itemId} restored from trash`);
    }
    
    // Remove from trash
    await db.delete(trashItems).where(eq(trashItems.id, trashItemId));
  }

  async permanentDeleteFromTrash(trashItemId: string): Promise<void> {
    // Get the trash item
    const trashItem = await db.select().from(trashItems)
      .where(eq(trashItems.id, trashItemId))
      .limit(1);
    
    if (!trashItem || trashItem.length === 0) {
      throw new Error(`Trash item with ID ${trashItemId} not found`);
    }

    const item = trashItem[0];
    
    // Permanently delete the original item based on type
    if (item.itemType === 'task') {
      await db.delete(tasks).where(eq(tasks.taskId, item.itemId));
    }
    // Add more item types here when implemented
    
    // Remove from trash
    await db.delete(trashItems).where(eq(trashItems.id, trashItemId));
  }

  async emptyTrash(): Promise<void> {
    // Get all trash items
    const allTrashItems = await db.select().from(trashItems);
    
    // Permanently delete all original items
    for (const item of allTrashItems) {
      if (item.itemType === 'task') {
        await db.delete(tasks).where(eq(tasks.taskId, item.itemId));
      }
      // Add more item types here when implemented
    }
    
    // Clear the trash
    await db.delete(trashItems);
  }

  async searchAll(query: string): Promise<{
    people: User[];
    projects: Project[];
    tasks: Task[];
    files: any[];
    notes: any[];
  }> {
    if (!query.trim()) {
      return { people: [], projects: [], tasks: [], files: [], notes: [] };
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    // Search users (people)
    const searchedPeople = await db.select()
      .from(users)
      .where(ilike(users.username, searchTerm))
      .limit(10);

    // Search projects
    const searchedProjects = await db.select()
      .from(projects)
      .where(
        or(
          ilike(projects.title, searchTerm),
          ilike(projects.description, searchTerm),
          ilike(projects.clientName, searchTerm)
        )
      )
      .limit(10);

    // Search tasks
    const searchedTasks = await db.select()
      .from(tasks)
      .where(
        or(
          ilike(tasks.title, searchTerm),
          ilike(tasks.description, searchTerm),
          ilike(tasks.createdBy, searchTerm)
        )
      )
      .limit(10);

    // For now, files and notes are empty as they're not implemented yet
    const files: any[] = [];
    const notes: any[] = [];

    return { people: searchedPeople, projects: searchedProjects, tasks: searchedTasks, files, notes };
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<string, Task>;
  private projects: Map<string, Project>;
  private messages: Map<string, TaskMessage[]>;
  private trashItems: Map<string, TrashItem>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.projects = new Map();
    this.messages = new Map();
    this.trashItems = new Map();
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
      markedComplete: null,
      markedCompleteBy: null,
      timeLogged: task.timeLogged ?? "0",
      workRecord: task.workRecord ?? false,
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
      updatedAt: new Date(),
    };
    this.tasks.set(taskId, updated);
    return updated;
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Move to universal trash system
    await this.moveToTrash(
      'task',
      taskId,
      task.title,
      task.description || '',
      { project: task.project, status: task.status },
      task,
      'system'
    );

    // Remove from tasks since it's now in trash
    this.tasks.delete(taskId);
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

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => !project.deletedAt)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async getProjectByProjectId(projectId: string): Promise<Project | undefined> {
    return this.projects.get(projectId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const now = new Date();
    const newProject: Project = {
      id: this.currentId++,
      projectId: project.projectId,
      title: project.title,
      description: project.description || null,
      status: project.status || 'in_progress',
      clientName: project.clientName || null,
      projectAddress: project.projectAddress || null,
      startDate: project.startDate || null,
      dueDate: project.dueDate || null,
      estimatedCompletion: project.estimatedCompletion || null,
      priority: project.priority || 'medium',
      createdBy: project.createdBy,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deletedBy: null,
    };
    
    this.projects.set(project.projectId, newProject);
    return newProject;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(projectId);
    if (!existing) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(projectId, updated);
    return updated;
  }

  async updateProjectStatus(projectId: string, status: 'in_progress' | 'on_hold' | 'completed'): Promise<Project> {
    const existing = this.projects.get(projectId);
    if (!existing) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updated: Project = {
      ...existing,
      status,
      updatedAt: new Date(),
    };
    this.projects.set(projectId, updated);
    return updated;
  }

  async deleteProject(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Count associated tasks
    const taskCount = Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId).length;

    // Move to universal trash system
    await this.moveToTrash(
      'project',
      projectId,
      project.title,
      project.description || '',
      { 
        clientName: project.clientName,
        status: project.status,
        taskCount
      },
      project,
      'system'
    );

    // Remove from projects since it's now in trash
    this.projects.delete(projectId);
  }

  async permanentDeleteProject(projectId: string): Promise<void> {
    this.projects.delete(projectId);
  }

  async getWorkRecords(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.workRecord === true);
  }

  // Trash methods
  async getAllTrashItems(): Promise<TrashItem[]> {
    return Array.from(this.trashItems.values())
      .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  }

  async moveToTrash(itemType: string, itemId: string, title: string, description: string, metadata: any, originalData: any, deletedBy: string): Promise<TrashItem> {
    const trashItem: TrashItem = {
      id: `trash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemType,
      itemId,
      title,
      description,
      metadata,
      originalData,
      deletedBy,
      deletedAt: new Date()
    };
    
    this.trashItems.set(trashItem.id, trashItem);
    return trashItem;
  }

  async restoreFromTrash(trashItemId: string): Promise<void> {
    const trashItem = this.trashItems.get(trashItemId);
    if (!trashItem) {
      throw new Error(`Trash item with ID ${trashItemId} not found`);
    }

    // Restore based on item type
    if (trashItem.itemType === 'task') {
      const task = this.tasks.get(trashItem.itemId);
      if (task) {
        const updatedTask: Task = {
          ...task,
          deletedAt: null,
          deletedBy: null
        };
        this.tasks.set(trashItem.itemId, updatedTask);
      }
    } else if (trashItem.itemType === 'project') {
      const originalProject = trashItem.originalData as Project;
      this.projects.set(trashItem.itemId, {
        ...originalProject,
        deletedAt: null,
        deletedBy: null
      });
    }
    
    // Remove from trash
    this.trashItems.delete(trashItemId);
  }

  async permanentDeleteFromTrash(trashItemId: string): Promise<void> {
    const trashItem = this.trashItems.get(trashItemId);
    if (!trashItem) {
      throw new Error(`Trash item with ID ${trashItemId} not found`);
    }

    // Permanently delete the original item based on type
    if (trashItem.itemType === 'task') {
      this.tasks.delete(trashItem.itemId);
    } else if (trashItem.itemType === 'project') {
      this.projects.delete(trashItem.itemId);
    }
    
    // Remove from trash
    this.trashItems.delete(trashItemId);
  }

  async emptyTrash(): Promise<void> {
    // Get all trash items
    const allTrashItems = Array.from(this.trashItems.values());
    
    // Permanently delete all original items
    for (const item of allTrashItems) {
      if (item.itemType === 'task') {
        this.tasks.delete(item.itemId);
      }
      // Add more item types here when implemented
    }
    
    // Clear the trash
    this.trashItems.clear();
  }

  async searchAll(query: string): Promise<{
    people: User[];
    projects: Project[];
    tasks: Task[];
    files: any[];
    notes: any[];
  }> {
    if (!query.trim()) {
      return { people: [], projects: [], tasks: [], files: [], notes: [] };
    }

    const searchTerm = query.toLowerCase();

    // Search users (people)
    const people = Array.from(this.users.values())
      .filter(user => 
        user.username.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);

    // Search projects
    const projects = Array.from(this.projects.values())
      .filter(project =>
        project.title.toLowerCase().includes(searchTerm) ||
        (project.description && project.description.toLowerCase().includes(searchTerm)) ||
        (project.clientName && project.clientName.toLowerCase().includes(searchTerm))
      )
      .slice(0, 10);

    // Search tasks
    const tasks = Array.from(this.tasks.values())
      .filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm)) ||
        task.createdBy.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);

    // For now, files and notes are empty as they're not implemented yet
    const files: any[] = [];
    const notes: any[] = [];

    return { people, projects, tasks, files, notes };
  }
}

// Use DatabaseStorage by default, fallback to MemStorage if needed
export const storage = new DatabaseStorage();
