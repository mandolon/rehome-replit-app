
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/contexts/TaskContext';

export const useTaskStatusChange = () => {
  const { toggleTaskStatus, updateTaskById } = useTaskContext();
  const { toast } = useToast();

  const handleStatusToggle = useCallback((taskId: number, taskTitle?: string) => {
    toggleTaskStatus(taskId);
  }, [toggleTaskStatus]);

  const markTaskComplete = useCallback((taskId: number, taskTitle: string, previousStatus: string) => {
    updateTaskById(taskId, { status: 'completed', archived: true });
    
    toast({
      title: "Task completed",
      description: `"${taskTitle}" has been marked as completed.`,
      action: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => updateTaskById(taskId, { status: previousStatus, archived: false })}
        >
          Undo
        </Button>
      ),
      duration: 5000,
    });
  }, [updateTaskById, toast]);

  const markTaskInProgress = useCallback((taskId: number) => {
    updateTaskById(taskId, { status: 'progress', archived: false });
  }, [updateTaskById]);

  return {
    handleStatusToggle,
    markTaskComplete,
    markTaskInProgress
  };
};
