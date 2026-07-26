import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../../api/services/tasks';
import type { Task } from '../../types/api';

// React Query hooks for Tasks
export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAllTasks,
  });
};

export const useDeveloperTasks = () => {
  return useQuery({
    queryKey: ['developerTasks'],
    queryFn: tasksService.getDeveloperTasks,
  });
};

export const useUpdateDeveloperTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      tasksService.updateDeveloperTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developerTasks'] });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: () => {
      // Invalidate and refetch tasks list after a new task is created
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
