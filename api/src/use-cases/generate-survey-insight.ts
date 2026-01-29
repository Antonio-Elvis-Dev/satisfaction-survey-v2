import { SurveysRepository } from "@/repositories/surveys-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";

import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

import { env } from "@/env";
import { prisma } from "@/lib/prisma";

interface GenerateAiInsightRequest {
    surveyId: string;
}

export class GenerateAiInsightUseCase {
    constructor(private surveysRepository: SurveysRepository) { }

    async execute({ surveyId }: GenerateAiInsightRequest) {
        // 1. Busca a pesquisa e TODAS as respostas
        const survey = await prisma.survey.findUnique({
            where: { id: surveyId },
            include: {
                question: {
                    include: {
                        responses: true
                    }
                }
            }
        });

        if (!survey) {
            throw new ResourceNotFoundError();
        }

        // 2. Filtra e Formata as Respostas
        const textInputs: string[] = [];

        survey.question.forEach(q => {
            q.responses.forEach(r => {
                if (r.text_response && r.text_response.trim().length > 3) {
                    textInputs.push(`Pergunta: "${q.question_text}" | Resposta do Usuário: "${r.text_response}"`);
                }
            });
        });

        if (textInputs.length < 3) {
            return {
                analysis: "Não há respostas textuais suficientes nesta pesquisa para gerar uma análise qualitativa com IA. Aguarde mais respostas."
            };
        }

        const dataForAi = textInputs.slice(0, 60).join("\n");

        // 3. Inicializa Gemini (Google Generative AI)
        // ⚠️ Certifique-se de que env.GEMINI_API_KEY está no seu .env e no env/index.ts
        // const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

        // Usamos o modelo 'gemini-1.5-flash' que é rápido e barato (equivalente ao gpt-4o-mini)
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 4. O Prompt
        const prompt = `
            Você é um Consultor Sênior de Customer Experience (CX) e Análise de Dados.
            
            Analise os dados da seguinte pesquisa de satisfação:
            **Título da Pesquisa:** ${survey.title}
            **Total de Respostas Coletadas:** ${survey.total_responses}

            Abaixo estão os comentários reais dos usuários:
            ---
            ${dataForAi}
            ---

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

        // 5. Chamada à API e Tratamento da Resposta (AQUI ESTAVA O ERRO)
        try {
            // const result = await model.generateContent(prompt);
            // const response = await result.response;

            // 👇 No Gemini, pegamos o texto assim, e não via choices[0]
            const { text } = await generateText({
                model: groq('llama-3.3-70b-versatile'),
                prompt: prompt,
            });

            console.log(text)
            return { analysis: text };

        } catch (error) {
            console.error("Erro na geração do Gemini:", error);
            throw new Error("Falha ao gerar insights com Gemini");
        }
    }
}