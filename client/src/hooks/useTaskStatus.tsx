
import { useTaskToast } from '@/components/ui/unified-toast';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';

export const useTaskStatus = (onTaskArchive?: (taskId: number) => void) => {
  const { taskCompleted } = useTaskToast();

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
      description: (
        <span>
          <span className="font-semibold">Task</span>
          {" "}has been restored.{" "}
          <button
            type="button"
            className="font-bold underline text-blue-700 hover:text-blue-600 transition-colors"
            tabIndex={0}
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Go to tasks
          </button>
        </span>
      ),
      duration: 3000,
    });
    
    console.log(`Undid completion for task ${taskId}, restored to ${previousStatus}`);
  };

  return {
    handleTaskStatusClick
  };
};
