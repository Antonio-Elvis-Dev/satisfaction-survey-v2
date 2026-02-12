import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { GenerateAiInsightUseCase } from "@/use-cases/generate-survey-insight"; 

export async function getAiAnalysis(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
        id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    try {
        const generateAiInsightUseCase = new GenerateAiInsightUseCase()

        // Isso pode levar alguns segundos (chamada externa), o frontend deve mostrar loading
        const { analysis } = await generateAiInsightUseCase.execute({
            surveyId: id
        })

        return reply.status(200).send({ analysis })

    } 
        catch (err: any) {
        // 👇 LOG DETALHADO PARA DEBUG
        console.error("========================================");
        console.error("❌ ERRO NA INTEGRAÇÃO COM IA:");
        
        if (err.response) {
            console.error("Status OpenAI:", err.status);
            console.error("Dados do Erro:", err.response.data);
        } else if (err.error) {
             console.error("Mensagem OpenAI:", err.error.message);
             console.error("Código OpenAI:", err.error.code);
        } else {
            console.error("Erro Geral:", err);
        }
        console.error("========================================");

        // Retorna o erro detalhado para o frontend (apenas para facilitar seu teste agora)
        return reply.status(500).send({ 
            message: 'Erro ao gerar análise com IA.',
            details: err.message || 'Erro desconhecido'
        })
    }
}