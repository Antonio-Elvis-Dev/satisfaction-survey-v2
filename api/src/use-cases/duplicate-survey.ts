import { SurveysRepository } from "@/repositories/survey-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";
import { prisma } from "@/lib/prisma"; // 👈 Certifica-te que isto está importado

interface DuplicateSurveyRequest {
    surveyId: string;
    userId: string;
}

export class DuplicateSurveyUseCase {
    constructor(private surveysRepository: SurveysRepository) {}

    async execute({ surveyId, userId }: DuplicateSurveyRequest) {
        // 1. Busca a pesquisa original USANDO O PRISMA DIRETAMENTE
        // Usamos o prisma aqui (e não o repository) para que o TypeScript
        // entenda automaticamente que 'question' e 'options' existem no resultado.
        const originalSurvey = await prisma.survey.findUnique({
            where: { id: surveyId },
            include: {
                question: { // Nome da relação no teu schema (singular)
                    include: {
                        options: true // Traz as opções também
                    }
                }
            }
        });

        if (!originalSurvey) {
            throw new ResourceNotFoundError();
        }

        // 2. Cria a nova pesquisa
       const newSurvey = await prisma.survey.create({
            data: {
                title: `${originalSurvey.title} (Cópia)`,
                description: originalSurvey.description,
                status: 'draft',
                created_by_id: userId,
                duplicated_from_id: originalSurvey.id,
                
                allow_anonymous: originalSurvey.allow_anonymous,
                show_progress_bar: originalSurvey.show_progress_bar,
                thank_you_message: originalSurvey.thank_you_message,

                // 👇 AQUI: Adicionamos "as any" para silenciar o erro do TypeScript
                question: {
                    create: (originalSurvey as any).question.map((q: any) => ({
                        question_text: q.question_text,
                        question_type: q.question_type,
                        order_index: q.order_index,
                        is_required: q.is_required,
                        min_rating: q.min_rating,
                        max_rating: q.max_rating,
                        max_length: q.max_length,
                        
                        options: {
                            create: q.options.map((o: any) => ({
                                option_text: o.option_text,
                                order_index: o.order_index
                            }))
                        }
                    }))
                }
            }
        });

        return { survey: newSurvey };
    }
}