// Centralized task API functions using direct fetch calls
import { Task } from '@/types/task';

export const taskApi = {
  // Get all active tasks (excluding deleted)
  async getTasks(): Promise<Task[]> {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Get all tasks including deleted ones
  async getAllTasks(): Promise<Task[]> {
    const response = await fetch('/api/tasks/all');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Get single task by ID
  async getTask(taskId: string): Promise<Task> {
    const response = await fetch(`/api/tasks/${taskId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Create new task
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Soft delete task (move to trash)
  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  // Permanently delete task
  async permanentDeleteTask(taskId: string): Promise<void> {
    const response = await fetch(`/api/tasks/${taskId}/permanent`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  // Restore task from trash
  async restoreTask(taskId: string): Promise<Task> {
    return this.updateTask(taskId, { deletedAt: null, deletedBy: null });
  }
};