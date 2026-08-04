import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/services/auth';

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};

export const useMe = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled,
  });
};
