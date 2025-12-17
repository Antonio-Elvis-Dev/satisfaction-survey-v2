import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Users as UsersIcon, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Users = () => {
  const { allUsers, isLoadingUsers, updateUserRole, isAdmin } = useRoles();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { label: 'Admin', icon: Crown, variant: 'default' as const },
      manager: { label: 'Manager', icon: Shield, variant: 'secondary' as const },
      viewer: { label: 'Viewer', icon: UsersIcon, variant: 'outline' as const },
    };
    const badge = badges[role as keyof typeof badges] || badges.viewer;
    const Icon = badge.icon;
    
    return (
      <Badge variant={badge.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  };

  if (isLoadingUsers) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as permissões dos usuários do sistema
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Usuários e Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allUsers && allUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allUsers?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{user.full_name || user.email || 'Sem nome'}</p>
                    {getRoleBadge(user.role)}
                  </div>
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      updateUserRole.mutate({
                        userId: user.id,
                        newRole: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Manager
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4" />
                          Viewer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Sobre as Permissões:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Crown className="w-4 h-4 mt-0.5 text-primary" />
              <span><strong>Admin:</strong> Acesso completo ao sistema, pode gerenciar usuários e todas as pesquisas</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-primary" />
              <span><strong>Manager:</strong> Pode criar e gerenciar suas próprias pesquisas e ver estatísticas</span>
            </li>
            <li className="flex items-start gap-2">
              <UsersIcon className="w-4 h-4 mt-0.5 text-primary" />
              <span><strong>Viewer:</strong> Pode apenas visualizar e responder pesquisas ativas</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
