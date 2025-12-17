import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export const useSurveys = () => {
  const queryClient = useQueryClient();

  const { data: surveys, isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tables<'surveys'>[];
    },
  });

  const createSurvey = useMutation({
    mutationFn: async (survey: Omit<TablesInsert<'surveys'>, 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('surveys')
        .insert({ ...survey, created_by: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  const updateSurvey = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tables<'surveys'>> }) => {
      const { data, error } = await supabase
        .from('surveys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  const updateSurveyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'active' | 'paused' | 'completed' }) => {
      const updates: Partial<Tables<'surveys'>> = { status };
      
      if (status === 'active') {
        updates.published_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.closed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('surveys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  const deleteSurvey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  const duplicateSurvey = useMutation({
    mutationFn: async (surveyId: string) => {
      // Get original survey
      const { data: originalSurvey, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (surveyError) throw surveyError;

      // Create new survey
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: newSurvey, error: createError } = await supabase
        .from('surveys')
        .insert({
          title: `${originalSurvey.title} (Cópia)`,
          description: originalSurvey.description,
          status: 'draft',
          created_by: user.id,
          duplicated_from: surveyId,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get original questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('survey_id', surveyId)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Duplicate questions and options
      for (const question of questions) {
        const { data: newQuestion, error: questionError } = await supabase
          .from('questions')
          .insert({
            survey_id: newSurvey.id,
            question_type: question.question_type,
            question_text: question.question_text,
            is_required: question.is_required,
            order_index: question.order_index,
            min_rating: question.min_rating,
            max_rating: question.max_rating,
            max_length: question.max_length,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Duplicate options if exists
        if (question.question_options && question.question_options.length > 0) {
          const optionsToInsert = question.question_options.map((opt: any) => ({
            question_id: newQuestion.id,
            option_text: opt.option_text,
            order_index: opt.order_index,
          }));

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }

      return newSurvey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  return {
    surveys,
    isLoading,
    createSurvey,
    updateSurvey,
    updateSurveyStatus,
    deleteSurvey,
    duplicateSurvey,
  };
};
