import { useCallback } from 'react';
import { Task } from '@/types/task';

export function useTaskStatusOperations(
  getAllTasks: () => Task[],
  updateTaskById: (taskId: number, updates: Partial<Task>) => void,
  archiveTask: (taskId: number) => void
) {
  const toggleTaskStatus = useCallback((taskId: number) => {
    const task = getAllTasks().find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'progress' : 'completed';
      updateTaskById(taskId, { status: newStatus });
    }
  }, [getAllTasks, updateTaskById]);

  const changeTaskStatus = useCallback((taskId: number, newStatus: "redline" | "progress" | "completed") => {
    updateTaskById(taskId, { status: newStatus });
  }, [updateTaskById]);

  return {
    toggleTaskStatus,
    changeTaskStatus,
  };
}