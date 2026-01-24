import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useDashboardStats = (days: number = 7) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', days],
    queryFn: async () => {
      // Uma única chamada resolve tudo! 🚀
      const response = await api.get('/dashboard/stats', {
        params: { days }
      });
      
      return response.data;
    },
  });
  return { stats, isLoading };
};
