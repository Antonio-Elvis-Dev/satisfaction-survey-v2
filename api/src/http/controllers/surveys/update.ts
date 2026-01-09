import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { UpdateSurveyUseCase } from "@/use-cases/update-survey";
import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";

export async function update(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.uuid(),
    })

    const bodySchema = z.object({
        title: z.string().min(3),
        description: z.string().nullable(),
        questions: z.array(z.object({
            id: z.string(), // ID opcional (novo vs existente)
            title: z.string(),
            type: z.enum(['short_text', 'long_text', 'multiple_choice', 'rating', 'nps']),
            isRequired: z.boolean(),
            orderIndex: z.number(),
            options: z.array(z.string()).optional()
        }))
    })

    const { id } = paramsSchema.parse(request.params)
    const { title, description, questions } = bodySchema.parse(request.body)
    const userId = request.user.sub

    try {
        const surveysRepository = new PrismaSurveyRepository()
        const updateSurveyUseCase = new UpdateSurveyUseCase(surveysRepository)


        const formattedQuestions = questions.map(q => ({
            title: q.title,
            type: q.type,
            isRequired: q.isRequired,
            orderIndex: q.orderIndex,
            options: q.options ?? [],

            ...(q.id ? { id: q.id } : {})

        }))


        await updateSurveyUseCase.execute({
            surveyId: id,
            userId,
            title,
            description,
            questions: formattedQuestions
        })

        return reply.status(204).send()

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'Survey not found.' })
        }
        throw err
    }
}