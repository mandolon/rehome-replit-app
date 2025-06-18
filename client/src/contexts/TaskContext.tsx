import React, { createContext, useContext } from 'react';
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
  const taskOperations = useTaskOperations();
  
  // Simplified context value without circular dependencies
  const value: TaskContextType = {
    // Task state
    customTasks: taskOperations.customTasks,
    archivedTasks: taskOperations.archivedTasks,
    editingTaskId: null,
    editingValue: '',
    refreshTrigger: taskOperations.refreshTrigger,
    
    // Task operations
    createTask: taskOperations.createTask,
    updateTaskById: taskOperations.updateTaskById,
    deleteTask: taskOperations.deleteTask,
    restoreDeletedTask: taskOperations.restoreDeletedTask,
    archiveTask: taskOperations.archiveTask,
    
    // Edit operations - simplified stubs
    startEditingTask: () => {},
    saveTaskEdit: () => {},
    cancelTaskEdit: () => {},
    setEditingValue: () => {},
    
    // Status operations
    toggleTaskStatus: (taskId: number) => {
      const task = taskOperations.customTasks.find(t => t.id === taskId);
      if (task) {
        const newStatus = task.status === 'completed' ? 'progress' : 'completed';
        taskOperations.updateTaskById(taskId, { status: newStatus });
      }
    },
    changeTaskStatus: (taskId: number, newStatus: "redline" | "progress" | "completed") => {
      taskOperations.updateTaskById(taskId, { status: newStatus });
    },
    
    // Assignment operations - simplified stubs
    assignPerson: () => {},
    removeAssignee: () => {},
    addCollaborator: () => {},
    removeCollaborator: () => {},
    
    // Navigation
    navigateToTask: taskOperations.navigateToTask,
    
    // Data getters
    getTasksByStatus: taskOperations.getTasksByStatus,
    getAllTasks: taskOperations.getAllTasks,
    
    // Refresh trigger
    triggerRefresh: taskOperations.triggerRefresh
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

TaskProvider.displayName = "TaskProvider";