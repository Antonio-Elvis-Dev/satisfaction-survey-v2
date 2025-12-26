import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { GetSurveyStatsUseCase } from "@/use-cases/get-survey-stats";
import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";
import { makeGetSurveyStatsUseCase } from "@/use-cases/factories/make-get-survey-stats-use-case";

export async function getStats(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)
    const userId = request.user.sub

    const getSurveyStatsUseCase = makeGetSurveyStatsUseCase()

    try {
        const stats = await getSurveyStatsUseCase.execute({
            surveyId: id,
            userId
        })

        return reply.status(200).send(stats)

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'Survey not found.' })
        }
        throw err
    }
}