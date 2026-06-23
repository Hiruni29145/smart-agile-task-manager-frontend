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
