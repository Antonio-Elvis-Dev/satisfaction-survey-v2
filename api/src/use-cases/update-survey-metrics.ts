import { SurveyMetricsRepository } from "@/repositories/survey-metrics-repository"; 
import { ResponseSessionsRepository } from "@/repositories/response-sessions-repository";
import { QuestionType } from "@prisma/client";

interface UpdateSurveyMetricsRequest {
    surveyId: string;
}

export class UpdateSurveyMetricsUseCase {
    constructor(
        private responseSessionsRepository: ResponseSessionsRepository,
        private surveyMetricsRepository: SurveyMetricsRepository
    ) {}

    async execute({ surveyId }: UpdateSurveyMetricsRequest): Promise<void> {
        // 1. Buscar todas as sessões (o repositório já traz responses + questions pelo include)
        const sessions = await this.responseSessionsRepository.findManyBySurveyId(surveyId);

        // Filtra apenas sessões completas
        // O uso do '?.' previne erro se sessions for undefined
        const completedSessions = sessions?.filter(s => s.is_complete) || [];
        const totalResponses = completedSessions.length;

        // Se não houver respostas completas, ainda assim pode ser útil salvar 0 no banco,
        // mas o return aqui economiza processamento se preferires.
        if (totalResponses === 0) {
            return;
        }

        // Variáveis acumuladoras
        let totalNpsScore = 0; // Nota: Se quiseres calcular média simples do NPS
        let npsRespondents = 0;
        let promoters = 0;
        let detractors = 0;
        let passives = 0;

        let totalRatingSum = 0;
        let ratingRespondents = 0;

        // 2. Iterar sobre todas as sessões e respostas
        for (const session of completedSessions) {
            
            // TRUQUE DE TYPE: Convertemos para 'any' para o TS não reclamar que 
            // 'responses' não existe no tipo base ResponseSession.
            // Sabemos que existe porque fizemos o 'include' no repositório.
            const currentSession = session as any;

            if (!currentSession.responses) continue;

            for (const response of currentSession.responses) {
                
                // Se não tiver valor numérico, ignora (ex: texto)
                if (response.numeric_response === null || response.numeric_response === undefined) continue;
                
                // Precisamos garantir que a pergunta veio junto
                if (!response.question) continue;

                const qType = response.question.question_type;
                const value = response.numeric_response;

                // --- Cálculo de NPS ---
                if (qType === QuestionType.nps) {
                    npsRespondents++;
                    // Opcional: Acumular o score bruto se quiseres média simples depois
                    totalNpsScore += value; 
                    
                    if (value >= 9) promoters++;
                    else if (value >= 7) passives++;
                    else detractors++;
                }

                // --- Cálculo de Rating (Estrelas) ---
                if (qType === QuestionType.rating) {
                    ratingRespondents++;
                    totalRatingSum += value;
                }
            }
        }

        // 3. Consolidar os Cálculos
        
        // NPS = % Promotores - % Detratores
        let finalNps = 0;
        if (npsRespondents > 0) {
            const promotersPercent = (promoters / npsRespondents) * 100;
            const detractorsPercent = (detractors / npsRespondents) * 100;
            finalNps = Math.round(promotersPercent - detractorsPercent);
        }

        // Average Rating
        let averageRating = 0;
        if (ratingRespondents > 0) {
            averageRating = Number((totalRatingSum / ratingRespondents).toFixed(2));
        }

        // Completion Rate (Taxa de conclusão)
        const completionRate = sessions.length > 0 
            ? Number(((completedSessions.length / sessions.length) * 100).toFixed(2)) 
            : 0;

        // 4. Salvar no Banco
        await this.surveyMetricsRepository.save({
            survey_id: surveyId,
            total_responses: sessions.length, // Total geral (incompletas + completas) ou só completas? Geralmente métrica de tráfego conta tudo.
            completed_responses: completedSessions.length,
            nps_score: finalNps,
            nps_promoters: promoters,
            nps_passives: passives,
            nps_detractors: detractors,
            average_rating: averageRating, 
            completion_rate: completionRate,
            updated_at: new Date()
        });
    }
}