// Define your API response and payload types here

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  assigneeId?: string;
  projectId: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string | null;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  key: string;
  status: string;
  deadline: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description: string;
  deadline: string;
}

export interface UpdateProjectPayload {
  name?: string;
  key?: string;
  description?: string;
  status?: string;
  deadline?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}
