import { SurveysRepository } from "@/repositories/survey-repository"; // Ajustei o import (plural)
import { ResourceNotFoundError } from "./erros/resource-not-found-error";
import { prisma } from "@/lib/prisma";

interface GetSurveyStatsRequest {
    surveyId: string;
    userId: string;
}

export class GetSurveyStatsUseCase {
    // constructor(private surveysRepository: SurveysRepository) { } // Repositório não usado no método atual, mas ok manter

    async execute({ surveyId, userId }: GetSurveyStatsRequest) {
        // 1. Verifica se a pesquisa existe
        const survey = await prisma.survey.findUnique({
            where: {
                id: surveyId,
            },
            include: {
                question: {
                    orderBy: { order_index: 'asc' },
                    include: {
                        options: { orderBy: { order_index: 'asc' } },
                        responses: {
                            select: {
                                id: true,
                                numeric_response: true,
                                text_response: true,
                                selected_option_id: true,
                                session: {
                                    select: {
                                        id: true,
                                        completed_at: true
                                    }
                                }
                            }
                        },
                    }
                },
                response_session: {
                    select: {
                        is_complete: true,
                        id: true
                    }
                }
            }
        })

        if (!survey) {
            throw new ResourceNotFoundError()
        }

        // =================================================================================
        // 🧠 CÁLCULO DE NPS E CSAT (Lógica Adicionada)
        // =================================================================================
        
        let npsScore = 0;
        let csatScore = 0;

        // Variáveis auxiliares para NPS
        let npsPromoters = 0;
        let npsDetractors = 0;
        let npsTotal = 0;

        // Variáveis auxiliares para CSAT
        let csatSum = 0;
        let csatCount = 0;

        // Itera sobre todas as perguntas para encontrar as de NPS e Rating
        survey.question.forEach(q => {
            // --- CÁLCULO NPS ---
            if (q.question_type === 'nps') {
                q.responses.forEach(r => {
                    if (r.numeric_response !== null) {
                        npsTotal++;
                        if (r.numeric_response >= 9) npsPromoters++;
                        if (r.numeric_response <= 6) npsDetractors++;
                    }
                });
            }

            // --- CÁLCULO CSAT (Rating) ---
            if (q.question_type === 'rating') {
                q.responses.forEach(r => {
                    if (r.numeric_response !== null) {
                        csatCount++;
                        csatSum += r.numeric_response;
                    }
                });
            }
        });

        // Finaliza Cálculo NPS: (Promotores% - Detratores%) * 100
        if (npsTotal > 0) {
            const promotersPercent = (npsPromoters / npsTotal) * 100;
            const detractorsPercent = (npsDetractors / npsTotal) * 100;
            npsScore = Math.round(promotersPercent - detractorsPercent);
        }

        // Finaliza Cálculo CSAT: Média transformada em porcentagem (0-100)
        // Assumindo escala de 5 estrelas. Se for média simples (1-5), remova a multiplicação.
        if (csatCount > 0) {
            const average = csatSum / csatCount;
            // Transforma média 1-5 em porcentagem 0-100%
            csatScore = Math.round((average / 5) * 100); 
        }

        // =================================================================================

        const totalSessions = survey.response_session.length
        const completedResponses = survey.response_session.filter(s => s.is_complete).length ?? 0
        const completionRate = totalSessions > 0
            ? Math.round((completedResponses / totalSessions) * 100) : 0

        const allResponses: any[] = [];
        
        // 2. Processa as estatísticas pergunta por pergunta (Gráficos)
        const stats = survey.question.map(question => {
            const totalResponses = question.responses.length;
            let chartData: any[] = [];
            let textResponses: string[] = [];

            // Popula a lista plana de respostas para o frontend
            question.responses.forEach(r => {
                allResponses.push({
                    id: r.id,
                    session_id: r.session?.id,
                    question_text: question.question_text,
                    question_type: question.question_type,
                    numeric_response: r.numeric_response,
                    text_response: r.text_response,
                    completed_at: r.session?.completed_at,
                    selected_option_id: r.selected_option_id,
                    selected_option_text: question.options.find(o => o.id === r.selected_option_id)?.option_text
                });
            });

            // Lógica dos Gráficos
            if (question.question_type === 'multiple_choice') {
                const counts = new Map<string, number>();
                question.options.forEach(opt => counts.set(opt.id, 0));
                question.responses.forEach(r => {
                    if (r.selected_option_id && counts.has(r.selected_option_id)) {
                        counts.set(r.selected_option_id, counts.get(r.selected_option_id)! + 1);
                    }
                });
                chartData = question.options.map(opt => ({
                    name: opt.option_text,
                    value: counts.get(opt.id) || 0
                }));
            } else if (['rating', 'nps'].includes(question.question_type)) {
                const counts = new Map<number, number>();
                const max = question.question_type === 'nps' ? 10 : (question.max_rating || 5);
                const min = question.question_type === 'nps' ? 0 : 1;
                for (let i = min; i <= max; i++) counts.set(i, 0);

                question.responses.forEach(r => {
                    if (r.numeric_response !== null) {
                        counts.set(r.numeric_response, (counts.get(r.numeric_response) || 0) + 1);
                    }
                });
                chartData = Array.from(counts.entries()).map(([key, value]) => ({
                    name: String(key),
                    value
                }));
            } else {
                textResponses = question.responses
                    .map(r => r.text_response)
                    .filter((t): t is string => t !== null)
                    .slice(0, 10);
            }

            return {
                id: question.id,
                title: question.question_text,
                type: question.question_type,
                totalResponses,
                chartData,
                textResponses
            };
        });

        return {
            survey: {
                id: survey.id,
                title: survey.title,
                createdAt: survey.created_at,
                status: survey.status
            },
            metrics: {
                totalResponses: totalSessions,
                completedResponses,
                completionRate,
                // ✅ Agora passamos as variáveis calculadas
                nps_score: npsScore,
                csat_score: csatScore 
            },
            stats,
            responses: allResponses
        }
    }
}