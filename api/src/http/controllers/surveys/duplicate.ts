import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { DuplicateSurveyUseCase } from "@/use-cases/duplicate-survey";
import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";

export async function duplicate(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)
    const userId = request.user.sub

    try {
        const surveysRepository = new PrismaSurveyRepository()
        const duplicateSurveyUseCase = new DuplicateSurveyUseCase(surveysRepository)

        await duplicateSurveyUseCase.execute({
            surveyId: id,
            userId
        })

        return reply.status(201).send() // 201 Created

    } catch (err) {
        console.error("Erro no Backend ao duplicar:", err);

        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'Survey not found.' })
        }

        // Retorna o erro real para o frontend (apenas em dev)
        return reply.status(500).send({ message: 'Internal Server Error', error: err })
    }
}