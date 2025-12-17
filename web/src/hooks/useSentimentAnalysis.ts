import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSentimentAnalysis = (surveyId: string) => {
  const queryClient = useQueryClient();

  const { data: sentiments, isLoading } = useQuery({
    queryKey: ['sentiment-analysis', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;

      // Fetch sentiment data joined with responses
      const { data, error } = await supabase
        .from('response_sentiment')
        .select(`
          *,
          responses:response_id (
            text_response,
            answered_at
          )
        `)
        .order('processed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!surveyId,
  });

  const analyzeSentiment = useMutation({
    mutationFn: async (surveyId: string) => {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { surveyId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sentiment-analysis', surveyId] });
      const count = data?.analyzed || 0;
      if (count > 0) {
        toast.success(`✨ ${count} ${count === 1 ? 'resposta analisada' : 'respostas analisadas'} com sucesso!`, {
          description: 'A análise de sentimento foi concluída'
        });
      } else {
        toast.info('Nenhuma resposta nova para analisar');
      }
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