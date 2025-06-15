
import { fetchAllTasks, fetchTaskById, createTask, updateTask, deleteTask } from "./api";
import { Task } from "@/types/task";

// Re-export API functions with original names for compatibility
export async function insertTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">) {
  return createTask(task);
}

export { fetchAllTasks };

export async function updateTaskSupabase(taskId: string, updates: Partial<Task>) {
  return updateTask(taskId, updates);
}

export async function deleteTaskSupabase(taskId: string) {
  return deleteTask(taskId);
}
