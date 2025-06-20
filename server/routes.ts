import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertTaskSchema, insertTaskMessageSchema } from "@shared/schema";
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
      const task = await storage.updateTask(req.params.taskId, req.body);
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

  return httpServer;
}
