import { apiClient } from '../client';
import type { Task } from '../../types/api';

// API service functions for Tasks
export const tasksService = {
  getAllTasks: () => apiClient<Task[]>('/tasks'),
  
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
