import { Task } from '@/types/task';
import { baseTasks } from './tasksBase';
import { getProjectDisplayName } from './projectClientHelpers';

// Unique task ID generator state
let nextTaskIdNumber = 5;

// Generate a new task id
export const generateTaskId = (): string => {
  const taskId = `T${nextTaskIdNumber.toString().padStart(4, '0')}`;
  nextTaskIdNumber++;
  return taskId;
};

export const getNextTaskId = (): string => {
  return `T${nextTaskIdNumber.toString().padStart(4, '0')}`;
};

export const getAllTasksRaw = (): Task[] => {
  return getTasksWithProjectNames();
};

export const getTasksWithProjectNames = (): Task[] => {
  return baseTasks.map(task => ({
    ...task,
    project: getProjectDisplayName(task.projectId)
  }));
};

export const getTasksByStatus = (status: string): Task[] => {
  return getTasksWithProjectNames().filter(task => task.status === status && !task.archived);
};

export const getTasksByProjectId = (projectId: string): Task[] => {
  return getTasksWithProjectNames().filter(task => task.projectId === projectId && !task.archived);
};

export const getTaskById = (id: number): Task | undefined => {
  const task = baseTasks.find(task => task.id === id);
  if (task) {
    return {
      ...task,
      project: getProjectDisplayName(task.projectId)
    };
  }
  return undefined;
};

export const getTaskByTaskId = (taskId: string): Task | undefined => {
  const task = baseTasks.find(task => task.taskId === taskId);
  if (task) {
    return {
      ...task,
      project: getProjectDisplayName(task.projectId)
    };
  }
  return undefined;
};

export const addTask = (
  taskData: Omit<Task, "id" | "taskId" | "createdAt" | "updatedAt">
): Task => {
  const now = new Date().toISOString();
  const newTask: Task = {
    ...taskData,
    id: Date.now(),
    taskId: generateTaskId(),
    project: getProjectDisplayName(taskData.projectId),
    createdBy: taskData.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  baseTasks.push(newTask);
  return newTask;
};

export const updateTask = (id: number, updates: Partial<Task>): Task | null => {
  const taskIndex = baseTasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    baseTasks[taskIndex] = { 
      ...baseTasks[taskIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (updates.projectId) {
      baseTasks[taskIndex].project = getProjectDisplayName(updates.projectId);
    }
    return baseTasks[taskIndex];
  }
  return null;
};

export const softDeleteTask = (id: number, deletedBy: string): Task | null => {
  const taskIndex = baseTasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    baseTasks[taskIndex] = {
      ...baseTasks[taskIndex],
      deletedAt: new Date().toISOString(),
      deletedBy: deletedBy,
      updatedAt: new Date().toISOString()
    };
    return baseTasks[taskIndex];
  }
  return null;
};

export const restoreTask = (id: number): Task | null => {
  const taskIndex = baseTasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    const { deletedAt, deletedBy, ...taskWithoutDeletedFields } = baseTasks[taskIndex];
    baseTasks[taskIndex] = {
      ...taskWithoutDeletedFields,
      updatedAt: new Date().toISOString()
    };
    return baseTasks[taskIndex];
  }
  return null;
};
