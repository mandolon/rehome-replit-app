
import { useTaskToast } from '@/components/ui/unified-toast';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/schemas/task';

export const useTaskStatus = (onTaskArchive?: (taskId: number) => void) => {
  const { taskCompleted } = useTaskToast();
  const { toast } = useToast();

  const handleTaskStatusClick = (taskId: number, tasks: Task[], onTaskUpdate: (taskId: number, updates: Partial<Task>) => void) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== 'completed') {
      const previousStatus = task.status;
      
      onTaskUpdate(taskId, { status: 'completed', archived: true });
      
      if (onTaskArchive) {
        onTaskArchive(taskId);
      }
      
      taskCompleted(task.title, () => handleUndoComplete(taskId, previousStatus, onTaskUpdate));
      
      console.log(`Completed and archived task ${taskId}`);
    } else if (task && task.status === 'completed') {
      onTaskUpdate(taskId, { status: 'progress', archived: false });
      console.log(`Unarchived task ${taskId}`);
    }
  };

  const handleUndoComplete = (taskId: number, previousStatus: string, onTaskUpdate: (taskId: number, updates: Partial<Task>) => void) => {
    onTaskUpdate(taskId, { status: previousStatus, archived: false });
    
    toast({
      description: "Task has been restored.",
      duration: 3000,
    });
    
    console.log(`Undid completion for task ${taskId}, restored to ${previousStatus}`);
  };

  return {
    handleTaskStatusClick
  };
};
