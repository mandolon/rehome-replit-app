export interface TaskUser {
  id?: string;                  // Can be used for unique user identification (optional for backward compatibility)
  name: string;
  avatar: string;               // Can be used for legacy avatar data (letters or image, fallback)
  fullName?: string;
  avatarColor?: string;         // Allows passing avatarColor property as in user settings
}

export interface Task {
  id: number;
  taskId: string; // Human-readable task ID like T0001, T0002, etc.
  title: string;
  projectId: string;
  project: string | null; // Match API response
  estimatedCompletion: string | null;
  dateCreated: string | null;
  dueDate: string | null;
  assignee: TaskUser | null;
  hasAttachment: boolean;
  collaborators: TaskUser[];
  status: string;
  archived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  description: string | null;
}

export interface TaskGroup {
  title: string;
  count: number;
  color: string;
  status: string;
  tasks: Task[];
}
