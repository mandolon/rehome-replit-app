import { Task, TaskUser } from '@/lib/schemas/task';

// Mock users for tasks
const mockUsers: TaskUser[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'JD',
    fullName: 'John Doe',
    avatarColor: '#3B82F6',
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'JS',
    fullName: 'Jane Smith',
    avatarColor: '#10B981',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'MJ',
    fullName: 'Mike Johnson',
    avatarColor: '#F59E0B',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    avatar: 'SW',
    fullName: 'Sarah Wilson',
    avatarColor: '#EF4444',
  },
];

// Mock tasks data with UI-expected statuses
let mockTasks: Task[] = [
  {
    id: 1,
    taskId: 'T0001',
    title: 'Design new homepage layout',
    projectId: 'proj-1',
    project: 'Website Redesign',
    estimatedCompletion: '2 days',
    dateCreated: '2024-01-15',
    dueDate: '2024-01-20',
    assignee: mockUsers[0],
    hasAttachment: false,
    collaborators: [mockUsers[1]],
    status: 'redline',
    archived: false,
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    deletedAt: null,
    deletedBy: null,
    description: 'Create a modern, responsive homepage layout with improved UX',
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: '0h',
  },
  {
    id: 2,
    taskId: 'T0002',
    title: 'Implement user authentication',
    projectId: 'proj-2',
    project: 'Mobile App',
    estimatedCompletion: '3 days',
    dateCreated: '2024-01-16',
    dueDate: '2024-01-22',
    assignee: mockUsers[1],
    hasAttachment: true,
    collaborators: [],
    status: 'progress',
    archived: false,
    createdBy: 'admin',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    deletedAt: null,
    deletedBy: null,
    description: 'Add secure login and registration functionality',
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: '4h',
  },
  {
    id: 3,
    taskId: 'T0003',
    title: 'Fix payment processing bug',
    projectId: 'proj-1',
    project: 'Website Redesign',
    estimatedCompletion: '1 day',
    dateCreated: '2024-01-17',
    dueDate: '2024-01-18',
    assignee: mockUsers[2],
    hasAttachment: false,
    collaborators: [mockUsers[0], mockUsers[3]],
    status: 'progress',
    archived: false,
    createdBy: 'admin',
    createdAt: '2024-01-17T11:00:00Z',
    updatedAt: '2024-01-17T16:45:00Z',
    deletedAt: null,
    deletedBy: null,
    description: 'Resolve issue with credit card validation',
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: '2h',
  },
  {
    id: 4,
    taskId: 'T0004',
    title: 'Write API documentation',
    projectId: 'proj-3',
    project: 'Backend Services',
    estimatedCompletion: '2 days',
    dateCreated: '2024-01-18',
    dueDate: '2024-01-25',
    assignee: mockUsers[3],
    hasAttachment: true,
    collaborators: [],
    status: 'completed',
    archived: false,
    createdBy: 'admin',
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-19T17:00:00Z',
    deletedAt: null,
    deletedBy: null,
    description: 'Create comprehensive API documentation with examples',
    markedComplete: '2024-01-19T17:00:00Z',
    markedCompleteBy: 'admin',
    timeLogged: '8h',
  },
  {
    id: 5,
    taskId: 'T0005',
    title: 'Setup CI/CD pipeline',
    projectId: 'proj-2',
    project: 'Mobile App',
    estimatedCompletion: '1 day',
    dateCreated: '2024-01-19',
    dueDate: '2024-01-21',
    assignee: null,
    hasAttachment: false,
    collaborators: [mockUsers[0], mockUsers[1]],
    status: 'redline',
    archived: false,
    createdBy: 'admin',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
    deletedAt: null,
    deletedBy: null,
    description: 'Configure automated testing and deployment',
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: '0h',
  },
];

// Service functions
export const taskService = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockTasks];
  },

  // Get task by ID
  async getTaskById(taskId: string): Promise<Task | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockTasks.find(task => task.taskId === taskId || task.id === Number(taskId)) || null;
  },

  // Create new task
  async createTask(taskData: Partial<Task>): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newTask: Task = {
      id: Math.max(...mockTasks.map(t => t.id)) + 1,
      taskId: `T${String(Math.max(...mockTasks.map(t => Number(t.taskId.slice(1)))) + 1).padStart(4, '0')}`,
      title: taskData.title || 'New Task',
      projectId: taskData.projectId || 'default',
      project: taskData.project || null,
      estimatedCompletion: taskData.estimatedCompletion || null,
      dateCreated: new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate || null,
      assignee: taskData.assignee || null,
      hasAttachment: false,
      collaborators: taskData.collaborators || [],
      status: taskData.status || 'redline',
      archived: false,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      deletedBy: null,
      description: taskData.description || null,
      markedComplete: null,
      markedCompleteBy: null,
      timeLogged: '0h',
    };

    mockTasks.push(newTask);
    return newTask;
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const taskIndex = mockTasks.findIndex(task => task.taskId === taskId || task.id === Number(taskId));
    if (taskIndex === -1) return null;

    const updatedTask = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  },

  // Delete task
  async deleteTask(taskId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const taskIndex = mockTasks.findIndex(task => task.taskId === taskId || task.id === Number(taskId));
    if (taskIndex === -1) return false;

    mockTasks.splice(taskIndex, 1);
    return true;
  },

  // Archive task
  async archiveTask(taskId: string): Promise<Task | null> {
    return this.updateTask(taskId, { archived: true });
  },

  // Get mock users
  getMockUsers(): TaskUser[] {
    return [...mockUsers];
  },
};
