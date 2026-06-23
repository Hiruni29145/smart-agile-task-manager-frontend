import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../../api/services/projects';

export const useProjects = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['projects', page, limit],
    queryFn: () => projectsService.getProjects(page, limit),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: (response) => {
      // Immediately add the new project to the cache for instant UI feedback
      queryClient.setQueriesData({ queryKey: ['projects'] }, (oldData: any) => {
        if (!oldData?.data?.items) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            items: [response.data, ...oldData.data.items]
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: number; data: any }) => {
      // Artificially extend loading time for better UX feedback
      const [res] = await Promise.all([
        projectsService.updateProject(args),
        new Promise((resolve) => setTimeout(resolve, 800))
      ]);
      return res;
    },
    onSuccess: (response, variables) => {
      // Immediately update the cache for instant UI feedback
      queryClient.setQueriesData({ queryKey: ['projects'] }, (oldData: any) => {
        if (!oldData?.data?.items) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            items: oldData.data.items.map((p: any) => 
              p.id === variables.id ? response.data : p
            )
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // Artificially extend loading time for better UX feedback
      const [res] = await Promise.all([
        projectsService.deleteProject(id),
        new Promise((resolve) => setTimeout(resolve, 800))
      ]);
      return res;
    },
    onSuccess: (_, deletedId) => {
      // Immediately remove from the cache for instant UI feedback
      queryClient.setQueriesData({ queryKey: ['projects'] }, (oldData: any) => {
        if (!oldData?.data?.items) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            items: oldData.data.items.filter((p: any) => p.id !== deletedId)
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
