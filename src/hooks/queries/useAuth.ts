import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/services/auth';

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useMe = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled,
  });
};
