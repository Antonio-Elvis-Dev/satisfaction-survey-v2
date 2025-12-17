import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export const useResponses = (surveyId: string) => {
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: async (data: { survey_id: string; respondent_id?: string }) => {
      const { data: session, error } = await supabase
        .from('response_sessions')
        .insert({
          survey_id: data.survey_id,
          respondent_id: data.respondent_id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return session;
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (response: TablesInsert<'responses'>) => {
      const { data, error } = await supabase
        .from('responses')
        .insert(response)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const completeSession = useMutation({
    mutationFn: async (data: { 
      sessionId: string; 
      timeSpentSeconds: number;
    }) => {
      const { error } = await supabase
        .from('response_sessions')
        .update({
          is_complete: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: data.timeSpentSeconds,
        })
        .eq('id', data.sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey-responses', surveyId] });
    },
  });

  return {
    createSession,
    submitResponse,
    completeSession,
  };
};
