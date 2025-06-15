import { ArchitectureRole } from './roles';

// TeamUser for demo
export interface TeamUser {
  id: string;
  name: string;
  fullName: string;
  role: ArchitectureRole;
  avatar: string;
  avatarColor?: string; // ADDED for consistency if needed
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  bio?: string;
  company?: string;
  role: ArchitectureRole;
  lastActive: string;
  notificationsMuted: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;
  avatarColor?: string; // ADDED
}

export interface UserContextType {
  currentUser: User;
  updateUserStatus: (status: User['status']) => void;
  toggleNotifications: () => void;
  updateUser: (updates: Partial<User>) => void;
}
