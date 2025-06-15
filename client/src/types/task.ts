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
  project: string; // Display name for backward compatibility
  estimatedCompletion: string;
  dateCreated: string;
  dueDate: string;
  assignee: TaskUser | null;
  hasAttachment: boolean;
  collaborators?: TaskUser[];
  status: string;
  archived?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
  description?: string; // <-- added field
}

export interface TaskGroup {
  title: string;
  count: number;
  color: string;
  status: string;
  tasks: Task[];
}
