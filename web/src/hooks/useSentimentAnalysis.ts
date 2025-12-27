import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSentimentAnalysis = (surveyId: string) => {
  const queryClient = useQueryClient();

  const { data: sentiments, isLoading } = useQuery({
    queryKey: ['sentiment-analysis', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;

      // Fetch sentiment data joined with responses
     
    },
    enabled: !!surveyId,
  });

  const analyzeSentiment = useMutation({
    mutationFn: async (surveyId: string) => {
      
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sentiment-analysis', surveyId] });
     
     
    },
    onError: (error) => {
      console.error('Error analyzing sentiment:', error);
      toast.error('Erro ao analisar sentimentos');
    }
  });

  const processedSentiments = {
    positive: sentiments?.filter(s => s.sentiment === 'positive').length || 0,
    neutral: sentiments?.filter(s => s.sentiment === 'neutral').length || 0,
    negative: sentiments?.filter(s => s.sentiment === 'negative').length || 0,
    total: sentiments?.length || 0,
  };

  return {
    sentiments,
    processedSentiments,
    isLoading,
    analyzeSentiment: analyzeSentiment.mutate,
    isAnalyzing: analyzeSentiment.isPending,
  };
};