import { makeCreateSurveyUseCase } from "@/use-cases/factories/make-create-survey-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { title } from "process";
import { z } from "zod";

export async function create(request: FastifyRequest, reply: FastifyReply) {
    const createSurveyBodySchema = z.object({
        title: z.string().min(3),
        description: z.string().nullable().optional(),
        questions: z.array(z.object({
            title: z.string(),
            type: z.enum(['short_text', 'long_text', 'multiple_choice', 'rating', 'nps']),
            is_required: z.boolean(),
            order_index: z.number(),
            options: z.array(z.string()).default([])
        }))
    })

    const {questions,title,description} = createSurveyBodySchema.parse(request.body)
    const userId = request.user.sub
    try {
        const createSurveyUseCase = makeCreateSurveyUseCase()

        await createSurveyUseCase.execute({
            userId,
            title,
            description: description ?? null,
            questions

        })

        return reply.status(201).send()
    } catch (error) {

    }

}