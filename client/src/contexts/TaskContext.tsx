import React, { createContext, useContext } from 'react';
import { Task } from '@/types/task';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useTaskEditing } from '@/hooks/useTaskEditing';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { useTaskStatusOperations } from '@/hooks/useTaskStatusOperations';
import { useCRMRole } from '@/pages/TeamsPage';

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

export const TaskProvider = React.memo(({ children }: TaskProviderProps) => {
  const taskOperations = useTaskOperations();
  const taskEditing = useTaskEditing(taskOperations.updateTaskById);
  const taskAssignments = useTaskAssignments(taskOperations.customTasks, taskOperations.updateTaskById);
  const taskStatusOperations = useTaskStatusOperations(
    taskOperations.customTasks,
    taskOperations.updateTaskById,
    taskOperations.archiveTask
  );
  const crmRole = useCRMRole();

  const value = React.useMemo((): TaskContextType => ({
    // Task state
    customTasks: taskOperations.customTasks,
    archivedTasks: taskOperations.archivedTasks,
    editingTaskId: taskEditing.editingTaskId,
    editingValue: taskEditing.editingValue,
    refreshTrigger: taskOperations.refreshTrigger,
    
    // Task operations
    createTask: taskOperations.createTask,
    updateTaskById: taskOperations.updateTaskById,
    deleteTask: taskOperations.deleteTask,
    restoreDeletedTask: taskOperations.restoreDeletedTask,
    archiveTask: taskOperations.archiveTask,
    
    // Edit operations
    startEditingTask: taskEditing.startEditingTask,
    saveTaskEdit: taskEditing.saveTaskEdit,
    cancelTaskEdit: taskEditing.cancelTaskEdit,
    setEditingValue: taskEditing.setEditingValue,
    
    // Status operations
    toggleTaskStatus: taskStatusOperations.toggleTaskStatus,
    changeTaskStatus: taskStatusOperations.changeTaskStatus,
    
    // Assignment operations
    assignPerson: taskAssignments.assignPerson,
    removeAssignee: taskAssignments.removeAssignee,
    addCollaborator: taskAssignments.addCollaborator,
    removeCollaborator: taskAssignments.removeCollaborator,
    
    // Navigation
    navigateToTask: taskOperations.navigateToTask,
    
    // Data getters
    getTasksByStatus: taskOperations.getTasksByStatus,
    getAllTasks: taskOperations.getAllTasks,
    
    // Refresh trigger
    triggerRefresh: taskOperations.triggerRefresh
  }), [
    taskOperations,
    taskEditing,
    taskAssignments,
    taskStatusOperations
  ]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
});

TaskProvider.displayName = "TaskProvider";
