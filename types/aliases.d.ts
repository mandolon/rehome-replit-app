declare module '@/lib/schemas/task' {
  import { Task, TaskUser, TaskGroup, TaskStatus } from '../client/src/lib/schemas/task';
  export type Task = Task;
  export type TaskUser = TaskUser;
  export type TaskGroup = TaskGroup;
  export type TaskStatus = TaskStatus;
}
