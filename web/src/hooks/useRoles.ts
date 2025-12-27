import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'manager' | 'viewer';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

interface UserWithRole {
  id: string;
  email?: string;
  full_name?: string;
  role: AppRole;
}

export const useRoles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: currentUserRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
    
    },
  });

  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Buscar todos os usuários do auth
     

      // Verificar se é admin
      // const { data: roleData } = await supabase
      //   .from('user_roles')
      //   .select('role')
      //   .eq('user_id', currentUser.)
      //   .single();

      // if (roleData?.role !== 'admin') return [];

      // Buscar profiles com roles
     
      // Combinar dados
    }
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // Deletar role existente
      
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

  // const isAdmin = currentUserRole === 'admin';
  // const isManager = currentUserRole === 'admin' || currentUserRole === 'manager';

  return {
    currentUserRole,
    isLoadingRole,
    allUsers,
    isLoadingUsers,
    updateUserRole,
    // isAdmin,
    // isManager,
  };
};
