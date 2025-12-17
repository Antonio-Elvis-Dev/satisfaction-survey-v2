import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'viewer' as AppRole;
      }

      return data?.role as AppRole || 'viewer';
    },
  });

  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Buscar todos os usuários do auth
      const { data: { users: currentUser } } = await supabase.auth.admin.listUsers({
        page:1,perPage:1000
      });
      if (!currentUser) return [];

      // Verificar se é admin
      // const { data: roleData } = await supabase
      //   .from('user_roles')
      //   .select('role')
      //   .eq('user_id', currentUser.)
      //   .single();

      // if (roleData?.role !== 'admin') return [];

      // Buscar profiles com roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Buscar roles de todos os usuários
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          role: (userRole?.role as AppRole) || 'viewer',
        };
      });

      return usersWithRoles;
    },
    enabled: currentUserRole === 'admin',
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // Deletar role existente
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Inserir nova role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;
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
    allUsers,
    isLoadingUsers,
    updateUserRole,
    isAdmin,
    isManager,
  };
};
