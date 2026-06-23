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
