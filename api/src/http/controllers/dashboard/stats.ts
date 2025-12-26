import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { GetDashboardStatsUseCase } from "@/use-cases/get-dashboard-stats";
import { makeGetDashboardStatsUseCase } from "@/use-cases/factories/make-get-dashboard-stats";

export async function stats(request: FastifyRequest, reply: FastifyReply) {
    const statsQuerySchema = z.object({
        days: z.coerce.number().default(7) // Converte string "7" para number 7
    })

    const { days } = statsQuerySchema.parse(request.query)
    const userId = request.user.sub
    const getDashboardStatsUseCase = makeGetDashboardStatsUseCase()
    const stats = await getDashboardStatsUseCase.execute({
        userId,
        days
    })

    // Adicionamos trends simulados para manter a UI bonita (mock)
    // Futuramente, calculamos comparando com o período anterior
    const responseWithTrends = {
        ...stats,
        trends: {
            surveys: 10,
            responses: 5,
            csat: 0,
            nps: 0
        }
    }

    return reply.status(200).send(responseWithTrends)
}