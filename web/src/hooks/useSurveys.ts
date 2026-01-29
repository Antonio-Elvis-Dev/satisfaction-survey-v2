import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CreateSurveyData {
  id?: string
  title: string
  description?: string | null
  questions: {
    id?: string
    title: string
    type: string
    is_required: boolean
    order_index: number
    options?: string[]
  }[]
}

export const useSurveys = () => {
  const queryClient = useQueryClient();

  const { data: fetchData, isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const response = await api.get('/surveys')
      return response.data
    },
    enabled: true
  });


  const createSurvey = useMutation({
    mutationFn: async (data: CreateSurveyData) => {
      const response = await api.post('/surveys', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Pesquisa criada com sucesso.')
    },
    onError: (error: any) => {
      console.log(error)
      toast.error('Erro ao criar pesquisa.')
    },

  });

  const updateSurvey = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateSurveyData }) => {
      await api.put(`/surveys/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Pesquisa atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar pesquisa.');
    }
  });

  const updateSurveyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'paused' | 'completed' }) => {
      // Chama a rota PATCH que criamos
      await api.patch(`/surveys/${id}/status`, { status });
    },
    onSuccess: () => {
      // Atualiza a lista na tela para refletir a mudança de ícone/cor imediatamente
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      // Se estiver dentro de uma pesquisa específica, invalida ela também
      queryClient.invalidateQueries({ queryKey: ['survey'] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao atualizar status da pesquisa.');
    }
  });



  const getSurveyById = async (id: string) => {
    const response = await api.get(`/public/surveys/${id}`)
    return response.data.survey
  }

  const deleteSurvey = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/surveys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Pesquisa excluída com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir pesquisa');
    }
  });

  const surveys = useMutation({
    mutationFn: async (id: string) => {
      await api.get(`/surveys/${id}/stats`)
    }
  })


  const duplicateSurvey = useMutation({
    mutationFn: async (id: string) => {
      // Chama a rota POST que criamos
      await api.post(`/surveys/${id}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Pesquisa duplicada com sucesso!');
    },
    onError: (error: any) => {
      console.error("Erro detalhado:", error.response?.data || error);
      toast.error('Erro ao duplicar pesquisa.');
    }
  });


  return {
    fetchData,
    isLoading,
    createSurvey,
    updateSurvey,
    updateSurveyStatus,
    getSurveyById,
    deleteSurvey,
    duplicateSurvey,
    surveys
  };
};
