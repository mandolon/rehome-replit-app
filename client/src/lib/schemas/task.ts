import { z } from 'zod';

export const TaskUserSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  avatar: z.string(),
  fullName: z.string().optional(),
  avatarColor: z.string().optional(),
});

// Define the status enum to match UI expectations
export const TaskStatusSchema = z.enum(['redline', 'progress', 'completed']);

export const TaskSchema = z.object({
  id: z.number(),
  taskId: z.string(),
  title: z.string(),
  projectId: z.string(),
  project: z.string().nullable(),
  estimatedCompletion: z.string().nullable(),
  dateCreated: z.string().nullable(),
  dueDate: z.string().nullable(),
  assignee: TaskUserSchema.nullable(),
  hasAttachment: z.boolean(),
  collaborators: z.array(TaskUserSchema),
  status: z.string(), // Use string to match existing Task interface
  archived: z.boolean(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  deletedBy: z.string().nullable(),
  description: z.string().nullable(),
  markedComplete: z.string().nullable(),
  markedCompleteBy: z.string().nullable(),
  timeLogged: z.string(),
});

export const TaskGroupSchema = z.object({
  title: z.string(),
  count: z.number(),
  color: z.string(),
  status: z.string(), // Use string to match existing TaskGroup interface
  tasks: z.array(TaskSchema),
});

export type TaskUser = z.infer<typeof TaskUserSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskGroup = z.infer<typeof TaskGroupSchema>;
