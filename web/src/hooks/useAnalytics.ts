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
  metrics: {
    totalResponses: number;
    completedResponses: number;
    completionRate: number;
    nps_score?: number;
    csat_score?: number;
  };
  stats: any[];
  responses: any[];
}


export const useAnalytics = (surveyId: string) => {

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
    metrics: data?.metrics,
    responses: data?.responses,
    isLoading,
    error
  };


};