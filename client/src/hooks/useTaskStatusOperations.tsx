import { useCallback } from 'react';
import { Task } from '@/types/task';

export function useTaskStatusOperations(
  customTasks: Task[],
  updateTaskById: (taskId: number, updates: Partial<Task>) => void,
  archiveTask: (taskId: number) => void
) {
  const toggleTaskStatus = useCallback((taskId: number) => {
    const task = customTasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'progress' : 'completed';
      updateTaskById(taskId, { status: newStatus });
    }
  }, [customTasks, updateTaskById]);

  const changeTaskStatus = useCallback((taskId: number, newStatus: "redline" | "progress" | "completed") => {
    updateTaskById(taskId, { status: newStatus });
  }, [updateTaskById]);

  return {
    toggleTaskStatus,
    changeTaskStatus,
  };
}