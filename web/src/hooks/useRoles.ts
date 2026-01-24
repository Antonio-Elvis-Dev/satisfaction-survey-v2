import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export type AppRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: AppRole;
  createdAt: string;
}

export const useRoles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: currentUserRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const response = await api.get('/me');
      return response.data.role;
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const response = await api.get<User[]>('/users');
      return response.data;
    },
    enabled: currentUserRole === 'admin'
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // 🔹 Correção: Implementação da chamada à API
      // Certifique-se que seu backend tem essa rota (PATCH ou PUT)
      await api.patch(`/users/${userId}/role`, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'Sucesso',
        description: 'Permissão atualizada com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar permissão',
        variant: 'destructive',
      });
    },
  });

  const isAdmin = currentUserRole === 'admin';
  const isManager = currentUserRole === 'admin' || currentUserRole === 'manager';

  return {
    currentUserRole,
    isLoadingRole,
    users,
    isLoadingUsers,
    updateUserRole,
    isAdmin,
    isManager,
  };
};
