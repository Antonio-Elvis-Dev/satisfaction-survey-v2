import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useQuestions = (surveyId?: string) => {
  const { data: questions, isLoading } = useQuery({
    queryKey: ['public-survey-questions', surveyId],
    queryFn: async () => {
      if (!surveyId) return [];
      
      try {
        // Usa a rota PÚBLICA que criamos no backend
        const response = await api.get(`/public/surveys/${surveyId}`);
        const survey = response.data.survey;

        // Retorna as perguntas ordenadas
        // O backend retorna 'question' (do Prisma), mapeamos se necessário
        if (survey && survey.question) {
            return survey.question.sort((a: any, b: any) => a.order_index - b.order_index);
        }
        
        return [];
      } catch (error) {
        console.error("Erro ao buscar perguntas:", error);
        return [];
      }
    },
    enabled: !!surveyId,
    retry: false
  });

  return {
    questions,
    isLoading,
    // Removemos createQuestion/Option pois a edição agora é feita via useSurveys/Update
  };
};