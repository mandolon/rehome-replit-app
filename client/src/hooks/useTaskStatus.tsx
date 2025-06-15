
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';

export const useTaskStatus = (onTaskArchive?: (taskId: number) => void) => {
  const { toast } = useToast();

  const handleTaskStatusClick = (taskId: number, tasks: Task[], onTaskUpdate: (taskId: number, updates: Partial<Task>) => void) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== 'completed') {
      const previousStatus = task.status;
      
      onTaskUpdate(taskId, { status: 'completed', archived: true });
      
      if (onTaskArchive) {
        onTaskArchive(taskId);
      }
      
      toast({
        title: "Task completed",
        description: `"${task.title}" has been marked as completed.`,
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUndoComplete(taskId, previousStatus, onTaskUpdate)}
          >
            Undo
          </Button>
        ),
        duration: 5000,
      });
      
      console.log(`Completed and archived task ${taskId}`);
    } else if (task && task.status === 'completed') {
      onTaskUpdate(taskId, { status: 'progress', archived: false });
      console.log(`Unarchived task ${taskId}`);
    }
  };

  const handleUndoComplete = (taskId: number, previousStatus: string, onTaskUpdate: (taskId: number, updates: Partial<Task>) => void) => {
    onTaskUpdate(taskId, { status: previousStatus, archived: false });
    
    toast({
      title: "Task restored",
      description: "Task has been restored to its previous status.",
      duration: 3000,
    });
    
    console.log(`Undid completion for task ${taskId}, restored to ${previousStatus}`);
  };

  return {
    handleTaskStatusClick
  };
};
