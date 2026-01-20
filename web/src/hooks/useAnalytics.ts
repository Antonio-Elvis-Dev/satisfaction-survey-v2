import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';


export interface QuestionStats {
  id: string;
  title: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'rating' | 'nps';
  totalResponses: number;
  chartData: { name: string; value: number }[];
  textResponses: string[];
}

interface AnalyticsData {
  survey: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  };
   metrics: { // <--- Novo campo
    totalResponses: number;
    completedResponses: number;
    completionRate: number;
  };
  stats: QuestionStats[];
}


export const useAnalytics = (surveyId: string) => {

  //  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
  //     queryKey: ['survey-metrics', surveyId],
  //     queryFn: async () => {
  //       const data = await api.get(`/`)


  //       return data || {
  //         survey_id: surveyId,
  //         total_responses: 0,
  //         completed_responses: 0,
  //         completion_rate: 0,
  //         average_rating: 0,
  //         nps_score: 0,
  //         csat_score: 0,
  //       };
  //     },
  //     enabled: !!surveyId,
  //   });


  /////////////////////////////////////////////////

  const { data, isLoading, error } = useQuery({
    queryKey: ['survey-analytics', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;

      const response = await api.get<AnalyticsData>(`/surveys/${surveyId}/stats`);
      return response.data;
    },
    enabled: !!surveyId, // Só roda se tivermos um ID
  });

  return {
    analytics: data, // Retorna o objeto completo { survey, stats }
    isLoading,
    error
  };


};