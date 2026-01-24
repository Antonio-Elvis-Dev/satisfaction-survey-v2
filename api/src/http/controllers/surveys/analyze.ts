import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AnalyzeSentimentUseCase } from "@/use-cases/analyze-sentiment";
import { makeAnalyzeSentimentUseCase } from "@/use-cases/factories/make-analyze-sentiment-use-case";

export async function analyze(request: FastifyRequest, reply: FastifyReply) {
    const analyzeBodySchema = z.object({
        text: z.string(),
    })

    const { text } = analyzeBodySchema.parse(request.body)

    const analyzeSentimentUseCase = makeAnalyzeSentimentUseCase()
    const result = analyzeSentimentUseCase.execute({ text })

    return reply.status(200).send(result)
}