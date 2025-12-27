import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TablesInsert } from '@/integrations/supabase/types';

export const useQuestions = (surveyId?: string) => {
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', surveyId],
    queryFn: async () => {
      if (!surveyId) return [];
      
      
    },
    enabled: !!surveyId,
  });

  const createQuestion = useMutation({
    mutationFn: async (question: TablesInsert<'questions'>) => {
     
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', surveyId] });
    },
  });

  const createQuestionOption = useMutation({
    mutationFn: async (option: TablesInsert<'question_options'>) => {
    
    },
  });

  return {
    questions,
    isLoading,
    createQuestion,
    createQuestionOption,
  };
};
