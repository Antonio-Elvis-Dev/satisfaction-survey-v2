import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = (surveyId: string) => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['survey-metrics', surveyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_metrics')
        .select('*')
        .eq('survey_id', surveyId)
        .maybeSingle();  // ← Mudou de .single() para .maybeSingle()
      
      if (error) {
        console.error('Erro ao buscar métricas:', error);
        throw error;
      }

      return data || {
        survey_id: surveyId,
        total_responses: 0,
        completed_responses: 0,
        completion_rate: 0,
        average_rating: 0,
        nps_score: 0,
        csat_score: 0,
      };
    },
    enabled: !!surveyId,
  });

  const { data: responses, isLoading: responsesLoading } = useQuery({
    queryKey: ['complete-responses', surveyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complete_responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!surveyId,
  });

  // Process responses for charts
  const processedData = {
    satisfactionDistribution: responses?.reduce((acc: any[], r) => {
      if (r.question_type === 'rating' && r.numeric_response !== null && r.numeric_response !== undefined) {
        const existing = acc.find(x => x.value === r.numeric_response);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ value: r.numeric_response, count: 1 });
        }
      }
      return acc;
    }, []) || [],
    
    npsDistribution: responses?.reduce((acc: any, r) => {
      if (r.question_type === 'nps' && r.numeric_response !== null && r.numeric_response !== undefined) {
        if (r.numeric_response <= 6) acc.detractors++;
        else if (r.numeric_response <= 8) acc.passives++;
        else acc.promoters++;
      }
      return acc;
    }, { detractors: 0, passives: 0, promoters: 0 }) || { detractors: 0, passives: 0, promoters: 0 },
    
    openResponses: responses?.filter(r => r.text_response) || []
  };

  return {
    metrics,
    responses,
    processedData,
    isLoading: metricsLoading || responsesLoading,
    error: metricsError,
  };
};