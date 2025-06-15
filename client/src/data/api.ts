import { apiRequest } from '@/lib/queryClient';
import { Task } from '@/types/task';

// Task API functions
export async function fetchAllTasks(): Promise<Task[]> {
  return apiRequest('/api/tasks');
}

export async function fetchTaskById(taskId: string): Promise<Task> {
  return apiRequest(`/api/tasks/${taskId}`);
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  return apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  return apiRequest(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  return apiRequest(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

// Task Message API functions
export interface TaskMessage {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTaskMessages(taskId: string): Promise<TaskMessage[]> {
  return apiRequest(`/api/tasks/${taskId}/messages`);
}

export async function createTaskMessage(
  taskId: string, 
  userId: string, 
  userName: string, 
  message: string
): Promise<TaskMessage> {
  return apiRequest(`/api/tasks/${taskId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      userName,
      message,
    }),
  });
}