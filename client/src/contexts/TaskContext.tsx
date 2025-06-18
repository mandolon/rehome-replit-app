import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { Task } from '@/types/task';
import { useTaskOperations } from '@/hooks/useTaskOperations';

// TaskContext interface
interface TaskContextType {
  // Task state
  customTasks: Task[];
  archivedTasks: Task[];
  editingTaskId: number | null;
  editingValue: string;
  refreshTrigger: number;
  
  // Task operations
  createTask: (taskData: any) => void;
  updateTaskById: (taskId: number, updates: Partial<Task>) => void;
  deleteTask: (taskId: number) => Promise<void>;
  restoreDeletedTask: (taskId: number) => void;
  archiveTask: (taskId: number) => void;
  
  // Edit operations
  startEditingTask: (task: Task) => void;
  saveTaskEdit: (taskId: number) => void;
  cancelTaskEdit: () => void;
  setEditingValue: (value: string) => void;
  
  // Status operations
  toggleTaskStatus: (taskId: number) => void;
  changeTaskStatus: (taskId: number, newStatus: "redline" | "progress" | "completed") => void;
  
  // Assignment operations
  assignPerson: (taskId: string, person: { name: string; avatar: string; fullName?: string }) => void;
  removeAssignee: (taskId: string) => void;
  addCollaborator: (taskId: string, person: { name: string; avatar: string; fullName?: string }) => void;
  removeCollaborator: (taskId: string, collaboratorIndex: number) => void;
  
  // Navigation
  navigateToTask: (task: Task) => void;
  
  // Data getters
  getTasksByStatus: (status: string) => Task[];
  getAllTasks: () => Task[];
  
  // Refresh trigger
  triggerRefresh: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const {
    customTasks,
    archivedTasks,
    refreshTrigger,
    createTask,
    updateTaskById,
    deleteTask,
    restoreDeletedTask,
    archiveTask,
    navigateToTask,
    getTasksByStatus,
    getAllTasks,
    triggerRefresh
  } = useTaskOperations();
  
  // Status operations with stable references
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

  // Simple memoized context value
  const value: TaskContextType = useMemo(() => ({
    // Task state
    customTasks,
    archivedTasks,
    editingTaskId: null,
    editingValue: '',
    refreshTrigger,
    
    // Task operations
    createTask,
    updateTaskById,
    deleteTask,
    restoreDeletedTask,
    archiveTask,
    
    // Edit operations - simplified stubs
    startEditingTask: () => {},
    saveTaskEdit: () => {},
    cancelTaskEdit: () => {},
    setEditingValue: () => {},
    
    // Status operations
    toggleTaskStatus,
    changeTaskStatus,
    
    // Assignment operations - simplified stubs
    assignPerson: () => {},
    removeAssignee: () => {},
    addCollaborator: () => {},
    removeCollaborator: () => {},
    
    // Navigation
    navigateToTask,
    
    // Data getters
    getTasksByStatus,
    getAllTasks,
    
    // Refresh trigger
    triggerRefresh
  }), [
    customTasks,
    archivedTasks,
    refreshTrigger,
    createTask,
    updateTaskById,
    deleteTask,
    restoreDeletedTask,
    archiveTask,
    navigateToTask,
    getTasksByStatus,
    getAllTasks,
    triggerRefresh,
    toggleTaskStatus,
    changeTaskStatus
  ]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

TaskProvider.displayName = "TaskProvider";