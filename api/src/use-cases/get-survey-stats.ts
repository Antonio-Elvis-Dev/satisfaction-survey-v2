import { SurveysRepository } from "@/repositories/surveys-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";
import { prisma } from "@/lib/prisma";

interface GetSurveyStatsRequest {
    surveyId: string;
    userId: string;
}

export class GetSurveyStatsUseCase {
    constructor(private surveysRepository: SurveysRepository) { }

    async execute({ surveyId, userId }: GetSurveyStatsRequest) {
        // 1. Verifica se a pesquisa existe e pertence ao usuário
        const survey = await prisma.survey.findUnique({
            where: {
                id: surveyId,
                // created_by_id: userId
            },
            include: {
                question: {
                    orderBy: { order_index: 'asc' },
                    include: {
                        options: { orderBy: { order_index: 'asc' } },
                        // Trazemos as respostas para contar (apenas os campos necessários)
                        responses: {
                            select: {
                                numeric_response: true,
                                text_response: true,
                                selected_option_id: true,
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


        const totalSessions = survey.response_session.length
        const completedResponses = survey.response_session.filter(s => s.is_complete)
        const completionRate = totalSessions > 0
            ? Math.round((completedResponses / totalSessions) * 100) : 0

        // 2. Processa as estatísticas pergunta por pergunta
        const stats = survey.question.map(question => {
            const totalResponses = question.responses.length;

            // Estrutura base para o retorno
            let chartData: any[] = [];
            let textResponses: string[] = [];

            // Lógica para Múltipla Escolha (Gráfico de Pizza/Barra)
            if (question.question_type === 'multiple_choice') {
                // Inicializa contadores para cada opção (para mostrar mesmo as que têm 0 votos)
                const counts = new Map<string, number>();
                question.options.forEach(opt => counts.set(opt.id, 0));

                // Conta os votos
                question.responses.forEach(r => {
                    if (r.selected_option_id && counts.has(r.selected_option_id)) {
                        counts.set(r.selected_option_id, counts.get(r.selected_option_id)! + 1);
                    }
                });

                // Formata para o Frontend (Recharts gosta de { name, value })
                chartData = question.options.map(opt => ({
                    name: opt.option_text,
                    value: counts.get(opt.id) || 0
                }));
            }

            // Lógica para Rating/NPS (Histograma ou Média)
            else if (['rating', 'nps'].includes(question.question_type)) {
                // Agrupamos por valor (ex: quantos deram nota 1, nota 2...)
                const counts = new Map<number, number>();

                // Define o range (1 a 5 ou 0 a 10)
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
            }

            // Lógica para Texto (Lista simples)
            else {
                textResponses = question.responses
                    .map(r => r.text_response)
                    .filter((t): t is string => t !== null) // Remove nulos
                    .slice(0, 10); // Pega apenas os 10 últimos para não pesar
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
            },
            stats
        }
    }
}