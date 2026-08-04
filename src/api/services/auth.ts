import { apiClient } from '../client';
import type { LoginResponse, User } from '../../types/api';

export const authService = {
  login: (data: any) => 
    apiClient<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  forgotPassword: (data: { email: string }) =>
    apiClient<any>('/api/v1/auth/forgot/password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  resetPassword: (data: any) =>
    apiClient<any>('/api/v1/auth/reset/password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getMe: () => apiClient<User>('/api/v1/auth/me'),
};
