// Simplified task data management hook
import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '@/api/tasks';
import { Task, TaskGroup } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

export function useTaskData() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(errorMessage);
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create task
  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      const newTask = await taskApi.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      toast({ description: 'Task created successfully' });
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      toast({ 
        description: errorMessage,
        variant: 'destructive' 
      });
      throw err;
    }
  }, [toast]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskApi.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.taskId === taskId ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      toast({ 
        description: errorMessage,
        variant: 'destructive' 
      });
      throw err;
    }
  }, [toast]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.taskId !== taskId));
      toast({ description: 'Task moved to trash' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      toast({ 
        description: errorMessage,
        variant: 'destructive' 
      });
      throw err;
    }
  }, [toast]);

  // Group tasks by status
  const taskGroups: TaskGroup[] = [
    {
      status: 'backlog',
      title: 'Backlog',
      tasks: tasks.filter(task => task.status === 'backlog'),
      count: tasks.filter(task => task.status === 'backlog').length,
      color: 'bg-gray-100'
    },
    {
      status: 'todo',
      title: 'To Do',
      tasks: tasks.filter(task => task.status === 'todo'),
      count: tasks.filter(task => task.status === 'todo').length,
      color: 'bg-blue-100'
    },
    {
      status: 'in_progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 'in_progress'),
      count: tasks.filter(task => task.status === 'in_progress').length,
      color: 'bg-yellow-100'
    },
    {
      status: 'completed',
      title: 'Completed',
      tasks: tasks.filter(task => task.status === 'completed'),
      count: tasks.filter(task => task.status === 'completed').length,
      color: 'bg-green-100'
    }
  ];

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    taskGroups,
    isLoading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask
  };
}