import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import "dotenv/config";
import { env } from "@/env";

interface GenerateInsightRequest {
    surveyId: string;
}

interface GenerateInsightResponse {
    analysis: string;
    summary: string;
}

export class GenerateAiInsightUseCase {
    async execute({ surveyId }: GenerateInsightRequest): Promise<GenerateInsightResponse> {
        // 1. Fetch survey data and recent text responses
        const survey = await prisma.survey.findUnique({
            where: { id: surveyId },
            include: {
                survey_metrics: true
            }
        });

        if (!survey) {
            throw new Error("Survey not found");
        }

        // Fetch last 50 text responses to analyze (limit to avoid token overflow)
        const textResponses = await prisma.response.findMany({
            where: {
                session: { survey_id: surveyId },
                text_response: { not: null }
            },
            take: 50,
            orderBy: { answered_at: 'desc' },
            select: { text_response: true }
        });

        const comments = textResponses
            .map(r => r.text_response)
            .filter(Boolean)
            .join("\n- ");

        if (comments.length === 0) {
            return {
                analysis: "Não há comentários textuais suficientes para gerar uma análise qualitativa.",
                summary: "Sem dados suficientes."
            };
        }

        // 2. Call AI (Gemini)
        // Ensure GEMINI_API_KEY is in your .env
        const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

       
        try {
            const prompt = `
            Você é um Consultor Sênior de Customer Experience (CX) e Análise de Dados.
            
            Analise os dados da seguinte pesquisa de satisfação:
            **Título da Pesquisa:** ${survey.title}
            **Total de Respostas Coletadas:** ${survey.total_responses}
            
            Abaixo estão os comentários reais dos usuários:
            ---
            ${comments}
            ---

            Métricas atuais: NPS ${survey.survey_metrics?.nps_score || 'N/A'}, Nota Média ${survey.survey_metrics?.average_rating || 'N/A'}.

            Com base APENAS nestes dados, gere um relatório em Markdown com a seguinte estrutura:
            
            ### 📊 Resumo Executivo
            (Um parágrafo resumindo o sentimento geral: Positivo, Neutro ou Negativo e porquê).

            ### 😡 Principais Pontos de Dor (Reclamações)
            (Liste em bullet points os problemas mais recorrentes).

            ### 💚 Pontos Fortes (Elogios)
            (O que a empresa está fazendo certo).

            ### 🚀 Plano de Ação Sugerido
            (3 sugestões práticas e diretas para melhorar os resultados baseadas nas reclamações).

            Use uma linguagem profissional, direta e empática.
            `;

            const response = await client.models.generateContent({
                model: "gemini-2.0-flash", // or "gemini-1.5-flash"
                contents: prompt,
            });

            const text = response.text || "Não foi possível gerar a análise.";

            return {
                analysis: text,
                summary: "Análise baseada em " + textResponses.length + " comentários recentes."
            };

        } catch (error) {
            console.error("Erro na AI:", error);
            return {
                analysis: "Erro ao conectar com a inteligência artificial. Tente novamente mais tarde.",
                summary: "Erro no serviço de AI."
            };
        }
    }
}