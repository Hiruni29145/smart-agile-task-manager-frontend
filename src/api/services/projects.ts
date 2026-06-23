import { apiClient } from '../client';
import type { Project, CreateProjectPayload, UpdateProjectPayload, PaginatedResponse } from '../../types/api';

export const projectsService = {
  createProject: (data: CreateProjectPayload) =>
    apiClient<{ data: Project }>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getProjects: (page: number = 1, limit: number = 10) =>
    apiClient<{ data: PaginatedResponse<Project> }>(`/api/v1/projects?page=${page}&limit=${limit}`),

  updateProject: ({ id, data }: { id: number; data: UpdateProjectPayload }) =>
    apiClient<{ data: Project }>(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: number) =>
    apiClient<{ data: null }>(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    }),
};
