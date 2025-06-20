
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskGroup, TaskUser } from '@/types/task';
import { useUser } from '@/contexts/UserContext';
import { useRealtimeTasks } from './useRealtimeTasks';
import { fetchAllTasks, createTask, updateTask, deleteTask } from '@/data/api';
import { nanoid } from "nanoid";

// New: helper to deep copy and update list
function updateTaskInList(tasks: Task[], taskId: string, updater: (t: Task) => Task) {
  return tasks.map(t => t.taskId === taskId ? updater(t) : t);
}

export const useTaskBoard = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  
  // Enable real-time updates
  useRealtimeTasks();
  
  // Fetch tasks using React Query
  const { data: tasks = [], isLoading: loading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchAllTasks,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5000, // Keep data fresh for 5 seconds
    gcTime: 300000, // Keep cache for 5 minutes
  });



  // Dialog/quick add state
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Task groups powered by API - memoized to prevent unnecessary recalculations
  const taskGroups = React.useMemo((): TaskGroup[] => {
    if (!tasks || !Array.isArray(tasks)) {
      return [
        { title: "TASK/ REDLINE", count: 0, color: "bg-[#c62a2f]", status: "redline", tasks: [] },
        { title: "PROGRESS/ UPDATE", count: 0, color: "bg-blue-500", status: "progress", tasks: [] },
        { title: "COMPLETED", count: 0, color: "bg-green-500", status: "completed", tasks: [] }
      ];
    }
    
    const centralizedRedline = tasks.filter((task: any) => task.status === 'redline' && !task.archived && !task.deletedAt);
    const centralizedProgress = tasks.filter((task: any) => task.status === 'progress' && !task.archived && !task.deletedAt);
    const centralizedCompleted = tasks.filter((task: any) => task.status === 'completed' && !task.archived && !task.deletedAt);

    const taskGroups: TaskGroup[] = [
      {
        title: "TASK/ REDLINE",
        count: centralizedRedline.length,
        color: "bg-[#c62a2f]",
        status: "redline",
        tasks: centralizedRedline
      },
      {
        title: "PROGRESS/ UPDATE",
        count: centralizedProgress.length,
        color: "bg-blue-500",
        status: "progress",
        tasks: centralizedProgress
      },
      {
        title: "COMPLETED",
        count: centralizedCompleted.length,
        color: "bg-green-500",
        status: "completed",
        tasks: centralizedCompleted
      }
    ];
    return taskGroups;
  }, [tasks, refreshTrigger]);

  // Expose taskGroups directly instead of through a function
  const getTaskGroups = useCallback(() => taskGroups, [taskGroups]);

  // Generate a new taskId for every task insert
  const generateTaskId = () => "T" + Math.floor(Math.random() * 100000).toString().padStart(4, "0");

  // Create task mutation with optimistic updates
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      // Optimistically update to show the new task immediately
      queryClient.setQueryData(['tasks'], (old: Task[] = []) => [
        ...old,
        {
          ...newTask,
          id: Date.now(), // Temporary ID until server responds
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          archived: false,
          deletedAt: null,
          deletedBy: null,
          workRecord: false,
        }
      ]);
      
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // If the mutation fails, roll back
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setRefreshTrigger(prev => prev + 1);
    },
  });

  const handleCreateTask = useCallback(
    async (newTask: any) => {
      const taskId = newTask.taskId ?? generateTaskId();
      createTaskMutation.mutate({
        ...newTask,
        taskId,
        createdBy: currentUser?.name ?? currentUser?.email ?? "Unknown",
      });
      setIsTaskDialogOpen(false);
    },
    [currentUser, createTaskMutation]
  );

  const handleQuickAddSave = useCallback(
    async (taskData: any) => {
      const taskId = taskData.taskId ?? generateTaskId();
      createTaskMutation.mutate({
        ...taskData,
        taskId,
        createdBy: currentUser?.name ?? currentUser?.email ?? "Unknown",
      });
      setShowQuickAdd(null);
    },
    [currentUser, createTaskMutation]
  );

  const handleTaskClick = (task: Task) => {
    navigate(`/task/${task.taskId}`);
  };

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setRefreshTrigger(prev => prev + 1);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setRefreshTrigger(prev => prev + 1);
    },
  });

  const handleTaskArchive = async (taskId: number) => {
    const task = tasks.find((t: any) => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({ taskId: task.taskId, updates: { archived: true } });
    }
  };

  const handleTaskDeleted = async (taskId: string) => {
    const task = tasks.find((t: any) => t.taskId === taskId);
    if (task) {
      deleteTaskMutation.mutate(task.taskId);
    }
  };

  // Assignment handlers using API mutations
  const assignPerson = async (taskId: string, person: TaskUser) => {
    updateTaskMutation.mutate({ taskId, updates: { assignee: person } });
  };
  
  const removeAssignee = async (taskId: string) => {
    updateTaskMutation.mutate({ taskId, updates: { assignee: null } });
  };
  
  const addCollaborator = async (taskId: string, person: TaskUser) => {
    const task = tasks.find((t: any) => t.taskId === taskId);
    const collabs = (task?.collaborators ?? []).slice();
    if (!collabs.find((c: any) => c.id === person.id)) {
      collabs.push(person);
    }
    updateTaskMutation.mutate({ taskId, updates: { collaborators: collabs } });
  };
  
  const removeCollaborator = async (taskId: string, collaboratorIndex: number) => {
    const task = tasks.find((t: any) => t.taskId === taskId);
    const collabs = (task?.collaborators ?? []).slice();
    collabs.splice(collaboratorIndex, 1);
    updateTaskMutation.mutate({ taskId, updates: { collaborators: collabs } });
  };

  return {
    isTaskDialogOpen,
    setIsTaskDialogOpen,
    showQuickAdd,
    setShowQuickAdd,
    refreshTrigger,
    taskGroups,
    getTaskGroups,
    handleCreateTask,
    handleQuickAddSave,
    handleTaskClick,
    handleTaskArchive,
    handleTaskDeleted,
    // Assignment handlers for Supabase tasks only:
    assignPerson,
    removeAssignee,
    addCollaborator,
    removeCollaborator,
    tasks, // expose tasks for dependency tracking
    supabaseTasks: tasks, // expose realtime tasks for detail page
    supabaseTasksLoading: loading,
  };
};
