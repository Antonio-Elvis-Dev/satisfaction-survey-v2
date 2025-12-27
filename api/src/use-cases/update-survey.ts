import { SurveysRepository } from "@/repositories/surveys-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";
import { prisma } from "@/lib/prisma";

interface UpdateSurveyRequest {
    surveyId: string;
    userId: string;
    title: string;
    description?: string | null;
    questions: {
        id?: string; // Se tiver ID, atualiza. Se não, cria.
        title: string;
        type: 'short_text' | 'long_text' | 'multiple_choice' | 'rating' | 'nps';
        isRequired: boolean;
        orderIndex: number;
        options?: string[];
    }[];
}

export class UpdateSurveyUseCase {
    constructor(private surveysRepository: SurveysRepository) {}

    async execute({ surveyId, userId, title, description, questions }: UpdateSurveyRequest) {
        // 1. Verifica se a pesquisa existe (e permissão global ou do usuário)
        const existingSurvey = await this.surveysRepository.findById(surveyId);

        if (!existingSurvey) {
            throw new ResourceNotFoundError();
        }

        // 2. Transação para garantir consistência
        await prisma.$transaction(async (tx) => {
            // Atualiza dados básicos da pesquisa
            await tx.survey.update({
                where: { id: surveyId },
                data: { title, description }
            });

            // Estratégia Inteligente de Perguntas:
            // Para simplificar, vamos iterar sobre as perguntas enviadas.
            // (Nota: Deletar perguntas exige cuidado extra com as respostas já dadas. 
            // Nesta versão, focamos em Criar/Atualizar).

            for (const q of questions) {
                if (q.id && q.id.length > 10) { // Assume UUID válido se tiver ID
                    // ATUALIZA PERGUNTA EXISTENTE
                    await tx.question.update({
                        where: { id: q.id },
                        data: {
                            question_text: q.title,
                            question_type: q.type,
                            is_required: q.isRequired,
                            order_index: q.orderIndex,
                            // Recriar opções para simplificar (Delete + Create)
                            // Apenas se for múltipla escolha e tiver opções novas
                            options: q.type === 'multiple_choice' ? {
                                deleteMany: {}, // Limpa opções antigas
                                create: q.options?.map((opt, idx) => ({
                                    option_text: opt,
                                    order_index: idx
                                }))
                            } : undefined
                        }
                    });
                } else {
                    // CRIA NOVA PERGUNTA (Adicionada na edição)
                    await tx.question.create({
                        data: {
                            survey_id: surveyId,
                            question_text: q.title,
                            question_type: q.type,
                            is_required: q.isRequired,
                            order_index: q.orderIndex,
                            options: q.options ? {
                                create: q.options.map((opt, idx) => ({
                                    option_text: opt,
                                    order_index: idx
                                }))
                            } : undefined
                        }
                    });
                }
            }
        });
    }
}