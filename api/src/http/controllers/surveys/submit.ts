import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaResponseSessionsRepository } from "@/repositories/prisma/prisma-response-sessions-repository";
import { PrismaQuestionsRepository } from "@/repositories/prisma/prisma-questions-repository";
import { SubmitResponseUseCase } from "@/use-cases/submit-response";
import { makeSubmitResponseUseCase } from "@/use-cases/factories/make-submit-response";

export async function submit(request: FastifyRequest, reply: FastifyReply) {
    const submitParamSchema = z.object({
        id: z.uuid(),
    })

    const submitBodySchema = z.object({
        timeSpent: z.number(),
        answers: z.array(z.object({
            questionId: z.string().uuid(),
            value: z.union([z.string(), z.number()])
        }))
    })

    const { id } = submitParamSchema.parse(request.params)
    const { timeSpent, answers } = submitBodySchema.parse(request.body)

    // Tenta pegar o usuário se estiver logado (opcional)
    // Se a rota for 100% pública sem auth, isto será undefined
    // Se quiseres suportar "usuário logado responde", precisas passar o token no front
    const userId = null; 

    
    const submitResponseUseCase = makeSubmitResponseUseCase()

    await submitResponseUseCase.execute({
        surveyId: id,
        respondentId: userId,
        timeSpentSeconds: timeSpent,
        answers
    })

    return reply.status(201).send()
}