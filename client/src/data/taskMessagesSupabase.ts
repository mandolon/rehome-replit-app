
import { fetchTaskMessages, createTaskMessage } from "./api";
import type { TaskMessage } from "./api";

export type { TaskMessage };

export { fetchTaskMessages };

export async function insertTaskMessage(taskId: string, userId: string, userName: string, message: string): Promise<TaskMessage> {
  return createTaskMessage(taskId, userId, userName, message);
}

// Placeholder for real-time functionality - can be implemented with WebSockets later
export function subscribeToTaskMessages(taskId: string, callback: (msg: TaskMessage, eventType: string) => void) {
  // For now, return a mock channel object for compatibility
  return {
    unsubscribe: () => {},
  };
}
