import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { DeleteSurveyUseCase } from "@/use-cases/delete-survey";
import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";
import { makeDeleteSurveyUseCase } from "@/use-cases/factories/make-delete-survey-use-case";

export async function deleteSurvey(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    try {
        
        const deleteSurveyUseCase = makeDeleteSurveyUseCase()

        await deleteSurveyUseCase.execute({
            surveyId: id
        })

        return reply.status(204).send() // 204 No Content

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'Survey not found.' })
        }
        throw err
    }
}