import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CreateSurveyData {
  title: string
  description?: string | null
  questions: {
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

  });

  const updateSurveyStatus = useMutation({

  });

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

  const duplicateSurvey = useMutation({

  });

  return {
    fetchData,
    isLoading,
    createSurvey,
    updateSurvey,
    updateSurveyStatus,
    deleteSurvey,
    duplicateSurvey,
  };
};
