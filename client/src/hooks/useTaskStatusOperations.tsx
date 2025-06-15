import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';
import { getTasksByStatus } from '@/data/taskData';

export const useTaskStatusOperations = (
  customTasks: Task[],
  updateTaskById: (taskId: number, updates: Partial<Task>) => void,
  archiveTask: (taskId: number) => void
) => {
  const { toast } = useToast();

  const toggleTaskStatus = useCallback((taskId: number) => {
    // Get the task from centralized data or custom tasks
    const centralizedTask = getTasksByStatus('redline').concat(getTasksByStatus('progress')).concat(getTasksByStatus('completed')).find(t => t.id === taskId);
    const customTask = customTasks.find(t => t.id === taskId);
    const task = centralizedTask || customTask;
    
    if (task && task.status !== 'completed') {
      const previousStatus = task.status;
      
      updateTaskById(taskId, { status: 'completed', archived: true });
      archiveTask(taskId);
      
      toast({
        title: "Task completed",
        description: `"${task.title}" has been marked as completed.`,
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
      
      console.log(`Completed and archived task ${taskId}`);
    } else if (task && task.status === 'completed') {
      updateTaskById(taskId, { status: 'progress', archived: false });
      console.log(`Unarchived task ${taskId}`);
    }
  }, [customTasks, updateTaskById, archiveTask, toast]);

  // NEW: Change status to any value
  const changeTaskStatus = useCallback((taskId: number, newStatus: "redline" | "progress" | "completed") => {
    // Get current task
    const centralizedTask = getTasksByStatus('redline').concat(getTasksByStatus('progress')).concat(getTasksByStatus('completed')).find(t => t.id === taskId);
    const customTask = customTasks.find(t => t.id === taskId);
    const task = centralizedTask || customTask;
    if (!task) return;

    // If status unchanged, do nothing
    if (task.status === newStatus) return;

    // If new status is completed mark archived, else not
    const archived = newStatus === "completed" ? true : false;

    updateTaskById(taskId, { status: newStatus, archived });

    // Archive if moving to completed
    if (newStatus === "completed") {
      archiveTask(taskId);
      toast({
        title: "Task completed",
        description: `"${task.title}" has been marked as completed.`,
        duration: 4000,
      });
    } else {
      toast({
        title: "Status changed",
        description: `Task "${task.title}" moved to '${newStatus === "progress" ? "In Progress" : "Redline / To Do"}'.`,
        duration: 3000,
      });
    }
    console.log(`Changed task ${taskId} status to ${newStatus}`);
  }, [customTasks, updateTaskById, archiveTask, toast]);

  return {
    toggleTaskStatus,
    changeTaskStatus
  };
};
