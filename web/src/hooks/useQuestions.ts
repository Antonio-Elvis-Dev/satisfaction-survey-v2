import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export const useQuestions = (surveyId?: string) => {
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', surveyId],
    queryFn: async () => {
      if (!surveyId) return [];
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          question_options(*)
        `)
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!surveyId,
  });

  const createQuestion = useMutation({
    mutationFn: async (question: TablesInsert<'questions'>) => {
      const { data, error } = await supabase
        .from('questions')
        .insert(question)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', surveyId] });
    },
  });

  const createQuestionOption = useMutation({
    mutationFn: async (option: TablesInsert<'question_options'>) => {
      const { data, error } = await supabase
        .from('question_options')
        .insert(option)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return {
    questions,
    isLoading,
    createQuestion,
    createQuestionOption,
  };
};
