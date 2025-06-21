import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertTaskSchema, insertTaskMessageSchema, insertProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function to notify all connected clients
  function broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/all", async (req, res) => {
    try {
      const tasks = await storage.getAllTasksIncludingDeleted();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all tasks" });
    }
  });

  app.get("/api/tasks/:taskId", async (req, res) => {
    try {
      const task = await storage.getTaskByTaskId(req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedTask = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedTask);
      broadcast('task_created', task);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:taskId", async (req, res) => {
    try {
      // Convert date fields from strings to Date objects
      const updates = { ...req.body };
      
      if (updates.markedComplete && typeof updates.markedComplete === 'string') {
        updates.markedComplete = new Date(updates.markedComplete);
      }
      if (updates.dueDate && typeof updates.dueDate === 'string') {
        updates.dueDate = new Date(updates.dueDate);
      }
      if (updates.deletedAt && typeof updates.deletedAt === 'string') {
        updates.deletedAt = new Date(updates.deletedAt);
      }
      if (updates.createdAt && typeof updates.createdAt === 'string') {
        updates.createdAt = new Date(updates.createdAt);
      }
      if (updates.updatedAt && typeof updates.updatedAt === 'string') {
        updates.updatedAt = new Date(updates.updatedAt);
      }
      
      const task = await storage.updateTask(req.params.taskId, updates);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      broadcast('task_updated', task);
      res.json(task);
    } catch (error: any) {
      console.error(`Error updating task ${req.params.taskId}:`, error);
      res.status(500).json({ 
        error: "Failed to update task", 
        details: error?.message || String(error) 
      });
    }
  });

  app.patch("/api/tasks/:taskId", async (req, res) => {
    try {
      // Convert date fields from strings to Date objects
      const updates = { ...req.body };
      
      if (updates.markedComplete && typeof updates.markedComplete === 'string') {
        updates.markedComplete = new Date(updates.markedComplete);
      }
      if (updates.dueDate && typeof updates.dueDate === 'string') {
        updates.dueDate = new Date(updates.dueDate);
      }
      if (updates.deletedAt && typeof updates.deletedAt === 'string') {
        updates.deletedAt = new Date(updates.deletedAt);
      }
      if (updates.createdAt && typeof updates.createdAt === 'string') {
        updates.createdAt = new Date(updates.createdAt);
      }
      if (updates.updatedAt && typeof updates.updatedAt === 'string') {
        updates.updatedAt = new Date(updates.updatedAt);
      }
      
      const task = await storage.updateTask(req.params.taskId, updates);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      broadcast('task_updated', task);
      res.json(task);
    } catch (error: any) {
      console.error(`Error updating task ${req.params.taskId}:`, error);
      res.status(500).json({ 
        error: "Failed to update task", 
        details: error?.message || String(error) 
      });
    }
  });

  app.delete("/api/tasks/:taskId", async (req, res) => {
    try {
      await storage.deleteTask(req.params.taskId);
      broadcast('task_deleted', { taskId: req.params.taskId });
      res.status(204).send();
    } catch (error: any) {
      console.error(`Error deleting task ${req.params.taskId}:`, error);
      res.status(500).json({ 
        error: "Failed to delete task", 
        details: error?.message || String(error) 
      });
    }
  });

  app.delete("/api/tasks/:taskId/permanent", async (req, res) => {
    try {
      await storage.permanentDeleteTask(req.params.taskId);
      broadcast('task_deleted', { taskId: req.params.taskId });
      res.status(204).send();
    } catch (error: any) {
      console.error(`Error permanently deleting task ${req.params.taskId}:`, error);
      res.status(500).json({ 
        error: "Failed to permanently delete task", 
        details: error?.message || String(error) 
      });
    }
  });

  app.put("/api/tasks/:taskId/restore", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.taskId, { 
        deletedAt: null, 
        deletedBy: null 
      });
      broadcast('task_restored', task);
      res.json(task);
    } catch (error: any) {
      console.error(`Error restoring task ${req.params.taskId}:`, error);
      res.status(500).json({ 
        error: "Failed to restore task", 
        details: error?.message || String(error) 
      });
    }
  });

  // Task message routes
  app.get("/api/tasks/:taskId/messages", async (req, res) => {
    try {
      const messages = await storage.getTaskMessages(req.params.taskId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/tasks/:taskId/messages", async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        taskId: req.params.taskId,
      };
      const validatedMessage = insertTaskMessageSchema.parse(messageData);
      const message = await storage.createTaskMessage(validatedMessage);
      broadcast('message_created', message);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Work records routes
  app.patch("/api/tasks/:taskId/work-record", async (req, res) => {
    try {
      const { workRecord } = req.body;
      const task = await storage.updateTask(req.params.taskId, { workRecord });
      broadcast('task_updated', task);
      res.json(task);
    } catch (error: any) {
      console.error(`Error updating work record status for task ${req.params.taskId}:`, error);
      res.status(500).json({ 
        error: "Failed to update work record status", 
        details: error?.message || String(error) 
      });
    }
  });

  app.get("/api/work-records", async (req, res) => {
    try {
      const workRecords = await storage.getWorkRecords();
      res.json(workRecords);
    } catch (error: any) {
      console.error("Error fetching work records:", error);
      res.status(500).json({ 
        error: "Failed to fetch work records", 
        details: error?.message || String(error) 
      });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const results = await storage.searchAll(q);
      res.json(results);
    } catch (error: any) {
      console.error("Error performing search:", error);
      res.status(500).json({ 
        error: "Failed to perform search", 
        details: error?.message || String(error) 
      });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ 
        error: "Failed to fetch projects", 
        details: error?.message || String(error) 
      });
    }
  });

  app.get("/api/projects/:projectId", async (req, res) => {
    try {
      const project = await storage.getProjectByProjectId(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error(`Error fetching project ${req.params.projectId}:`, error);
      res.status(500).json({ 
        error: "Failed to fetch project", 
        details: error?.message || String(error) 
      });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedProject = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedProject);
      broadcast('project_created', project);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:projectId", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.projectId, req.body);
      broadcast('project_updated', project);
      res.json(project);
    } catch (error: any) {
      console.error(`Error updating project ${req.params.projectId}:`, error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(500).json({ 
        error: "Failed to update project", 
        details: error?.message || String(error) 
      });
    }
  });

  app.patch("/api/projects/:projectId/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!['in_progress', 'on_hold', 'completed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'in_progress', 'on_hold', or 'completed'" });
      }
      
      const project = await storage.updateProjectStatus(req.params.projectId, status);
      broadcast('project_status_updated', project);
      res.json(project);
    } catch (error: any) {
      console.error(`Error updating project status ${req.params.projectId}:`, error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(500).json({ 
        error: "Failed to update project status", 
        details: error?.message || String(error) 
      });
    }
  });

  app.delete("/api/projects/:projectId", async (req, res) => {
    try {
      await storage.deleteProject(req.params.projectId);
      broadcast('project_deleted', { projectId: req.params.projectId });
      res.status(204).send();
    } catch (error: any) {
      console.error(`Error deleting project ${req.params.projectId}:`, error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(500).json({ 
        error: "Failed to delete project", 
        details: error?.message || String(error) 
      });
    }
  });

  // Trash routes
  app.get("/api/trash", async (req, res) => {
    try {
      const trashItems = await storage.getAllTrashItems();
      res.json(trashItems);
    } catch (error: any) {
      console.error("Error fetching trash items:", error);
      res.status(500).json({ 
        error: "Failed to fetch trash items", 
        details: error?.message || String(error) 
      });
    }
  });

  app.post("/api/trash", async (req, res) => {
    try {
      const { itemType, itemId, title, description, metadata, originalData, deletedBy } = req.body;
      
      if (!itemType || !itemId || !title) {
        return res.status(400).json({ error: "Missing required fields: itemType, itemId, title" });
      }

      const trashItem = await storage.moveToTrash(
        itemType,
        itemId,
        title,
        description || '',
        metadata || {},
        originalData || {},
        deletedBy || 'Anonymous'
      );

      broadcast('item_moved_to_trash', { trashItem });
      res.status(201).json(trashItem);
    } catch (error: any) {
      console.error("Error moving item to trash:", error);
      res.status(500).json({ 
        error: "Failed to move item to trash", 
        details: error?.message || String(error) 
      });
    }
  });

  app.post("/api/trash/:trashItemId/restore", async (req, res) => {
    try {
      await storage.restoreFromTrash(req.params.trashItemId);
      broadcast('trash_item_restored', { trashItemId: req.params.trashItemId });
      res.status(204).send();
    } catch (error: any) {
      console.error(`Error restoring trash item ${req.params.trashItemId}:`, error);
      res.status(500).json({ 
        error: "Failed to restore item from trash", 
        details: error?.message || String(error) 
      });
    }
  });

  app.delete("/api/trash/:trashItemId", async (req, res) => {
    try {
      await storage.permanentDeleteFromTrash(req.params.trashItemId);
      broadcast('trash_item_deleted', { trashItemId: req.params.trashItemId });
      res.status(204).send();
    } catch (error: any) {
      console.error(`Error permanently deleting trash item ${req.params.trashItemId}:`, error);
      res.status(500).json({ 
        error: "Failed to permanently delete item from trash", 
        details: error?.message || String(error) 
      });
    }
  });

  app.delete("/api/trash", async (req, res) => {
    try {
      await storage.emptyTrash();
      broadcast('trash_emptied', {});
      res.status(204).send();
    } catch (error: any) {
      console.error("Error emptying trash:", error);
      res.status(500).json({ 
        error: "Failed to empty trash", 
        details: error?.message || String(error) 
      });
    }
  });

  return httpServer;
}
