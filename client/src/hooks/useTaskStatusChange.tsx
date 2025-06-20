
import { useCallback } from 'react';
import { useTaskToast } from '@/components/ui/unified-toast';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/contexts/TaskContext';

export const useTaskStatusChange = () => {
  const { toggleTaskStatus, updateTaskById } = useTaskContext();
  const { taskCompleted } = useTaskToast();

  const handleStatusToggle = useCallback((taskId: number, taskTitle?: string) => {
    toggleTaskStatus(taskId);
  }, [toggleTaskStatus]);

  const markTaskComplete = useCallback((taskId: number, taskTitle: string, previousStatus: string) => {
    updateTaskById(taskId, { status: 'completed', archived: true });
    
    taskCompleted(taskTitle, () => updateTaskById(taskId, { status: previousStatus, archived: false }));
  }, [updateTaskById, taskCompleted]);

  const markTaskInProgress = useCallback((taskId: number) => {
    updateTaskById(taskId, { status: 'progress', archived: false });
  }, [updateTaskById]);

  return {
    handleStatusToggle,
    markTaskComplete,
    markTaskInProgress
  };
};
