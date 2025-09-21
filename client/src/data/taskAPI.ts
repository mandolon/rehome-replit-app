
import { fetchAllTasks, fetchTaskById, createTask, updateTask, deleteTask } from "./api";
import { Task } from "@/lib/schemas/task";

// Re-export API functions with universal names for compatibility
export async function insertTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">) {
  return createTask(task);
}

export { fetchAllTasks };

export async function updateTaskAPI(taskId: string, updates: Partial<Task>) {
  return updateTask(taskId, updates);
}

export async function deleteTaskAPI(taskId: string) {
  return deleteTask(taskId);
}
