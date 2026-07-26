import { apiClient } from '../client';
import type { Task, PaginatedResponse } from '../../types/api';

// API service functions for Tasks
export const tasksService = {
  getAllTasks: () => apiClient<Task[]>('/tasks'),
  
  getDeveloperTasks: () => apiClient<PaginatedResponse<Task>>('/api/v1/developer/tasks'),
  
  updateDeveloperTaskStatus: (id: string | number, status: string) =>
    apiClient<Task>(`/api/v1/developer/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  getTaskById: (id: string) => apiClient<Task>(`/tasks/${id}`),
  
  createTask: (data: Partial<Task>) => 
    apiClient<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateTask: (id: string, data: Partial<Task>) => 
    apiClient<Task>(`/tasks/${id}`, {
      method: 'PUT', // or PATCH
      body: JSON.stringify(data),
    }),
    
  deleteTask: (id: string) => 
    apiClient<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
