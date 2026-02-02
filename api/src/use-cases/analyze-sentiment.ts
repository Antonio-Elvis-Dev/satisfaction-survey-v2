import Groq from "groq-sdk";
import "dotenv/config";

interface AnalyzeSentimentRequest {
    text: string;
}

interface AnalyzeSentimentResponse {
    score: number;      // De -5 a 5
    sentiment: 'positive' | 'negative' | 'neutral';
    explanation?: string; // Bónus: A IA explica porquê!
}

export class AnalyzeSentimentUseCase {
    private groq: Groq;

    constructor() {
        // Inicializa o cliente Groq
        // Certifica-te que tens GROQ_API_KEY no teu .env
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }

    async execute({ text }: AnalyzeSentimentRequest): Promise<AnalyzeSentimentResponse> {
        try {
            // Prompt de Engenharia: Ensinamos a IA como se comportar
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `
                            És um especialista em análise de sentimentos para pesquisas de satisfação (PT-BR).
                            A tua tarefa é analisar o comentário do utilizador e devolver um JSON estrito.
                            
                            Regras de Pontuação:
                            -5 (Ódio/Péssimo) a -1 (Negativo leve)
                            0 (Neutro)
                            1 (Positivo leve) a 5 (Amor/Excelente)

                            Responde APENAS com este formato JSON:
                            {
                                "score": number,
                                "sentiment": "positive" | "negative" | "neutral",
                                "explanation": "string curta resumindo o motivo"
                            }
                        `
                    },
                    {
                        role: "user",
                        content: `Comentário para analisar: "${text}"`
                    }
                ],
                model: "llama3-8b-8192", // Modelo rápido, leve e gratuito
                temperature: 0, // 0 = Mais determinístico/preciso, menos criativo
                response_format: { type: "json_object" } // Força a resposta em JSON (feature do Groq)
            });

            // Extrair e converter a resposta
            const content = completion.choices[0]?.message?.content || "{}";
            const result = JSON.parse(content);

            // Validação de segurança básica
            return {
                score: result.score || 0,
                sentiment: result.sentiment || 'neutral',
                explanation: result.explanation
            };

        } catch (error) {
            console.error("Erro na Groq AI:", error);
            // Fallback: Se a IA falhar, devolvemos neutro para não quebrar o app
            return {
                score: 0,
                sentiment: 'neutral',
                explanation: "Não foi possível analisar no momento."
            };
        }
    }
}