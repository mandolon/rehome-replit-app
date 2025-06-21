import React, { createContext, useContext, useState } from 'react';
import { Task } from '@/types/task';

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
  saveTaskEdit: (taskId: number | string) => void;
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

// Hardcoded placeholder tasks
const PLACEHOLDER_TASKS: Task[] = [
  {
    id: 17,
    taskId: "T9477",
    title: "Test Task for Development",
    projectId: "PRJ001",
    project: "Main Project",
    estimatedCompletion: null,
    dateCreated: "2024-06-15",
    dueDate: null,
    assignee: { name: "Sarah Chen", avatar: "SC", fullName: "Sarah Chen" },
    hasAttachment: true,
    collaborators: [],
    status: "progress",
    archived: false,
    createdBy: "admin",
    createdAt: "2024-06-15T10:00:00Z",
    updatedAt: "2024-06-15T10:00:00Z",
    deletedAt: null,
    deletedBy: null,
    description: "A test task for development purposes",
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: "0"
  }
];

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingValue(task.title);
  };

  const saveTaskEdit = async (taskId: number | string) => {
    if (!editingValue.trim()) {
      cancelTaskEdit();
      return;
    }

    try {
      // For real tasks, make API call with taskId (string like "T1234")
      let apiTaskId: string;
      
      if (typeof taskId === 'string' && taskId.startsWith('T')) {
        apiTaskId = taskId;
      } else {
        // Find the task to get the taskId for the API call
        const task = PLACEHOLDER_TASKS.find(t => t.id === taskId);
        if (!task) return;
        apiTaskId = task.taskId;
      }

      const response = await fetch(`/api/tasks/${apiTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingValue.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the placeholder task locally for consistency
      const taskIndex = PLACEHOLDER_TASKS.findIndex(t => 
        t.id === taskId || t.taskId === taskId
      );
      if (taskIndex !== -1) {
        PLACEHOLDER_TASKS[taskIndex] = {
          ...PLACEHOLDER_TASKS[taskIndex],
          title: editingValue.trim(),
          updatedAt: new Date().toISOString()
        };
      }

      setEditingTaskId(null);
      setEditingValue('');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save task edit:', error);
    }
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingValue('');
  };

  const updateTaskById = async (taskId: number, updates: Partial<Task>) => {
    try {
      // Find the task to get the taskId for the API call
      const task = PLACEHOLDER_TASKS.find(t => t.id === taskId);
      if (!task) return;

      // Prepare updates with proper date handling
      const sanitizedUpdates = { ...updates };
      
      // Keep date fields as strings for frontend consistency
      // Server will handle conversion to Date objects

      const response = await fetch(`/api/tasks/${task.taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedUpdates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the placeholder task locally
      const taskIndex = PLACEHOLDER_TASKS.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        PLACEHOLDER_TASKS[taskIndex] = {
          ...PLACEHOLDER_TASKS[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const value: TaskContextType = {
    // Task state
    customTasks: PLACEHOLDER_TASKS,
    archivedTasks: [],
    editingTaskId,
    editingValue,
    refreshTrigger,
    
    // Task operations - updateTaskById now functional
    createTask: () => {},
    updateTaskById,
    deleteTask: async () => {},
    restoreDeletedTask: () => {},
    archiveTask: () => {},
    
    // Edit operations - now functional
    startEditingTask,
    saveTaskEdit,
    cancelTaskEdit,
    setEditingValue,
    
    // Status operations
    toggleTaskStatus: async (taskId: number) => {
      const task = PLACEHOLDER_TASKS.find(t => t.id === taskId);
      if (!task) return;

      if (task.status === 'completed') {
        // Uncomplete the task
        await updateTaskById(taskId, { 
          status: 'progress', 
          archived: false,
          markedComplete: null,
          markedCompleteBy: null
        });
      } else {
        // Complete the task
        await updateTaskById(taskId, { 
          status: 'completed', 
          archived: true,
          markedComplete: new Date().toISOString(),
          markedCompleteBy: 'current_user' // Should be actual user
        });
      }
    },
    changeTaskStatus: async (taskId: number, newStatus: "redline" | "progress" | "completed") => {
      const updates: Partial<Task> = { status: newStatus };
      
      if (newStatus === 'completed') {
        updates.archived = true;
        updates.markedComplete = new Date().toISOString();
        updates.markedCompleteBy = 'current_user'; // Should be actual user
      } else {
        updates.archived = false;
        updates.markedComplete = null;
        updates.markedCompleteBy = null;
      }
      
      await updateTaskById(taskId, updates);
    },
    
    // Assignment operations - all placeholders
    assignPerson: () => {},
    removeAssignee: () => {},
    addCollaborator: () => {},
    removeCollaborator: () => {},
    
    // Navigation - placeholder
    navigateToTask: () => {},
    
    // Data getters
    getTasksByStatus: (status: string) => PLACEHOLDER_TASKS.filter(task => task.status === status),
    getAllTasks: () => PLACEHOLDER_TASKS,
    
    // Refresh trigger - now functional
    triggerRefresh: () => setRefreshTrigger(prev => prev + 1)
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};