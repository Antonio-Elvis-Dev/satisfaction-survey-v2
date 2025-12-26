import { prisma } from "@/lib/prisma"
import { SurveysRepository } from "@/repositories/surveys-repository"
import { title } from "process"
import { id } from "zod/v4/locales"

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
}

export class GetDashboardStatsUseCase {
    constructor(private surveysRepository: SurveysRepository) { }

    async execute({ userId, days }: GetDashboardStatsRequest): Promise<DashboardStatsResponse> {
        const activeSurveys = await prisma.survey.count({
            where: {
                created_by_id: userId,
                status: 'active'
            }
        })

        const totalResponses = await prisma.responseSession.count({
            where: {
                survey: {
                    created_by_id: userId
                },
                is_complete: true
            }
        })

        const recentSurveys = await prisma.survey.findMany({
            where: {
                created_by_id: userId
            },
            orderBy: { updated_at: 'desc' },
            take: 3,
            include: {
                _count: {
                    select: { response_session: true }
                }
            }
        })

        const formattedRecentSurveys = recentSurveys.map(s => ({
            id: s.id,
            title: s.title,
            status: s.status,
            totalResponses: s._count.response_session
        }))

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const sessions = await prisma.responseSession.findMany({
            where: {
                survey: { created_by_id: userId },
                completed_at: {
                    gte: startDate
                }
            }
        })

        const responsesMap = new Map<string, number>()

        for (let i = 0; i < days; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            responsesMap.set(dateStr, 0)
        }

        sessions.forEach(session => {
            if (session.completed_at) {
                const dateStr = session.completed_at.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                if (responsesMap.has(dateStr)) {
                    responsesMap.set(dateStr, (responsesMap.get(dateStr) || 0) + 1)
                }
            }
        })
        const responsesOverTime = Array.from(responsesMap, ([date, responses]) => ({ date, responses })).reverse();

        const avgNPS = 0;
        const avgCSAT = 0;

        return {
            activeSurveys,
            totalResponses,
            avgNPS,
            avgCSAT,
            recentSurveys: formattedRecentSurveys,
            responsesOverTime
        }
    }
}