import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { string } from 'zod';

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
   
  });

  const getSurveyById = async (id: string) => {
    const response = await api.get(`/surveys/${id}`)
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
  mutationFn: async (id:string) =>{
    await api.get(`/surveys/${id}/stats`)
  }
})
  
  // const { data: surveys, isLoading } = useQuery({
  //   queryKey: ['surveys'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('surveys')
  //       .select('*')
  //       .order('created_at', { ascending: false });
      
  //     if (error) throw error;
  //     return data as Tables<'surveys'>[];
  //   },
  // });


  const duplicateSurvey = useMutation({

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
