// Core API client configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Get token from local storage
  const token = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Attempt to parse error message from backend
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`API Error: ${response.statusText}`);
    }
  }

  // Handle empty responses
  if (response.status === 204) {
    return { data: {} as T, success: true, statusCode: 204, message: '', timestamp: '', path: '' };
  }

  return response.json();
};
