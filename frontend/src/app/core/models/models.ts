export type UserRole = 'Admin' | 'Project Manager' | 'Team Member';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  manager: User | string;
  members: User[] | string[];
  startDate?: string;
  deadline?: string;
  createdBy?: User | string;
  createdAt?: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface Attachment {
  filename: string;
  originalName: string;
  path: string;
  uploadedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  assignedTo?: User | string;
  createdBy?: User | string;
  status: TaskStatus;
  priority: Priority;
  deadline?: string;
  attachments?: Attachment[];
  order?: number;
  createdAt?: string;
}

export interface ChatMessage {
  _id: string;
  project: string;
  sender: User | { _id: string; name: string; avatar?: string };
  text: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  user: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Activity {
  _id: string;
  project: Project | string;
  user: User;
  action: string;
  entityType: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalUsers: number | null;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}
