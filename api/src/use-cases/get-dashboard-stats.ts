import { prisma } from "@/lib/prisma"
import { SurveysRepository } from "@/repositories/survey-repository"
import { QuestionType } from "@prisma/client"

interface GetDashboardStatsRequest {
    userId: string
    days: number
}

interface DashboardStatsResponse {
    activeSurveys: number
    totalResponses: number
    avgNPS: number
    avgCSAT: number
    recentSurveys: any[]
    responsesOverTime: { date: string; responses: number }[]
    trends: {
        surveys: number
        responses: number
        nps: number
        csat: number
    }
}

export class GetDashboardStatsUseCase {
    constructor(private surveysRepository: SurveysRepository) { }

    async execute({ userId, days }: GetDashboardStatsRequest): Promise<DashboardStatsResponse> {

        const now = new Date();

        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(now.getDate() - days);

        const previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - days);


        const allSurveys = await prisma.survey.findMany({
            where: {
                status: 'active'
            },
            include: {
                survey_metrics: true,
                created_by: true
            }
        });

        const activeSurveys = allSurveys.length;

       let totalNpsSum = 0;
        let totalCsatSum = 0;
        let surveysWithMetrics = 0;

        allSurveys.forEach(survey => {
         if (survey.survey_metrics && survey.survey_metrics.total_responses > 0) {
                totalNpsSum += survey.survey_metrics.nps_score || 0;
                totalCsatSum += Number(survey.survey_metrics.average_rating || 0);
                surveysWithMetrics++;
            }
        });

       const globalAvgNPS = surveysWithMetrics > 0 ? Math.round(totalNpsSum / surveysWithMetrics) : 0;
        const globalAvgCSAT = surveysWithMetrics > 0 ? Number((totalCsatSum / surveysWithMetrics).toFixed(1)) : 0;

        const totalResponses = await prisma.responseSession.count({
            where: {

                is_complete: true
            }
        })


        const getMetricsForPeriod = async (start: Date, end: Date) => {
            // Buscamos sessões nesse intervalo
            const sessions = await prisma.responseSession.findMany({
                where: {
                    completed_at: { gte: start, lt: end },
                    is_complete: true
                },
                include: {
                    responses: { include: { question: true } }
                }
            });

            const count = sessions.length;
            const createdSurveysCount = await prisma.survey.count({
                where: { created_at: { gte: start, lt: end } }
            });

            // Calcula NPS e CSAT "frescos" deste período apenas
            let promoters = 0;
            let detractors = 0;
            let npsRespondents = 0;
            let ratingSum = 0;
            let ratingCount = 0;

            sessions.forEach(session => {
                session.responses.forEach(r => {
                    if (r.question.question_type === QuestionType.nps && r.numeric_response !== null) {
                        npsRespondents++;
                        if (r.numeric_response >= 9) promoters++;
                        else if (r.numeric_response <= 6) detractors++;
                    }
                    if (r.question.question_type === QuestionType.rating && r.numeric_response !== null) {
                        ratingCount++;
                        ratingSum += r.numeric_response;
                    }
                });
            });

            const nps = npsRespondents > 0 
                ? Math.round(((promoters - detractors) / npsRespondents) * 100) 
                : 0;
            
            const csat = ratingCount > 0 
                ? Number((ratingSum / ratingCount).toFixed(1)) 
                : 0;

            return { count, nps, csat, createdSurveysCount };
        };

        const currentMetrics = await getMetricsForPeriod(currentPeriodStart, now);
        const previousMetrics = await getMetricsForPeriod(previousPeriodStart, currentPeriodStart);

        // Calcula variação percentual ou absoluta
        const calculateTrend = (current: number, previous: number, isPercentage: boolean = true) => {
            if (previous === 0) return current === 0 ? 0 : 100; // Se era 0 e agora é X, cresceu 100% (simbolicamente)
            if (!isPercentage) return Number((current - previous).toFixed(1)); // Diferença absoluta para Scores
            return Math.round(((current - previous) / previous) * 100);
        };

        const trends = {
            responses: calculateTrend(currentMetrics.count, previousMetrics.count),
            surveys: calculateTrend(currentMetrics.createdSurveysCount, previousMetrics.createdSurveysCount),
            nps: calculateTrend(currentMetrics.nps, previousMetrics.nps, false), // Diferença de pontos
            csat: calculateTrend(currentMetrics.csat, previousMetrics.csat, false) // Diferença de pontos (estrelas)
        };

        // --- 4. Dados para Gráficos e Listas ---
        
        // Pesquisas Recentes
        const recentSurveys = await prisma.survey.findMany({
            orderBy: { updated_at: 'desc' },
            take: 5,
            include: {
                _count: { select: { response_session: true } },
                created_by: { select: { full_name: true } }
            }
        });

        const formattedRecentSurveys = recentSurveys.map(s => ({
            id: s.id,
            title: s.title,
            status: s.status,
            author: s.created_by?.full_name || "Anônimo",
            totalResponses: s._count.response_session,
            total_responses: s._count.response_session 
        }));

        // Gráfico de Linha
        const responsesMap = new Map<string, number>();
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if(!responsesMap.has(dateStr)) responsesMap.set(dateStr, 0);
        }

        const sessionsForGraph = await prisma.responseSession.findMany({
            where: {
                completed_at: { gte: currentPeriodStart },
                is_complete: true // Apenas completas no gráfico
            }
        });

        sessionsForGraph.forEach(session => {
            if (session.completed_at) {
                const dateStr = session.completed_at.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                responsesMap.set(dateStr, (responsesMap.get(dateStr) || 0) + 1);
            }
        });

        const responsesOverTime = Array.from(responsesMap, ([date, responses]) => ({ date, responses })).reverse();

        return {
            activeSurveys,
            totalResponses,
            avgNPS: globalAvgNPS,
            avgCSAT: globalAvgCSAT,
            recentSurveys: formattedRecentSurveys,
            responsesOverTime,
            trends // <--- Aqui estão as porcentagens reais!
        };
    }
}