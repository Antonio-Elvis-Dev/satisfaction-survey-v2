import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { UpdateSurveyStatusUseCase } from "@/use-cases/update-survey-status";
import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";
import { makeUpdateSurveyStatusUseCase } from "@/use-cases/factories/make-update-survey-status-use-case";

export async function updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.uuid(),
    })

    const bodySchema = z.object({
        status: z.enum(['draft', 'active', 'paused', 'completed']),
    })

    const { id } = paramsSchema.parse(request.params)
    const { status } = bodySchema.parse(request.body)

    try {
      
        const updateSurveyStatusUseCase = makeUpdateSurveyStatusUseCase()

        await updateSurveyStatusUseCase.execute({
            surveyId: id,
            status
        })

        return reply.status(204).send()

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'Survey not found.' })
        }
        throw err
    }
}