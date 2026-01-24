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
            id: z.string().optional(), // ID opcional (novo vs existente)
            title: z.string().optional(),
            question_text: z.string().optional(),
            type: z.enum(['short_text', 'long_text', 'multiple_choice', 'rating', 'nps']),
            is_required: z.boolean(),
            order_index: z.number(),
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
            is_required: q.is_required,
            order_index: q.order_index,
            options: q.options ?? [],
            question_text: q.question_text,

            ...(q.id ? { id: q.id } : {})

        }))


        await updateSurveyUseCase.execute({
            surveyId: id,
            userId,
            title,
            description,
            questions: formattedQuestions as any
        })

        return reply.status(204).send()

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'Survey not found.' })
        }
        throw err
    }
}