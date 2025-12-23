import { SurveysRepository } from "@/repositories/surveys-repository";
import { Survey } from "@prisma/client";

interface CreateSurveyRequest {
    userId: string
    title: string
    description?: string | null
    questions: {
        title: string
        type: 'short_text' | 'long_text' | 'multiple_choice' | 'rating' | 'nps'
        is_required: boolean
        order_index: number
        options?: string[]
        

    }[]
}

interface CreateSurveyResponse {
    survey: Survey
}

export class CreateSurveyUseCase {

    constructor(private surveyRepository: SurveysRepository) { }

    async execute({ userId, title, description, questions }: CreateSurveyRequest): Promise<CreateSurveyResponse> {
        const survey = await this.surveyRepository.create({
          title,
            description: description ?? null,
            created_by: { connect: { id: userId } }, 
            question: {
                create: questions.map(q => ({
                    question_text: q.title,
                    question_type: q.type,
                    order_index: q.order_index,
                    is_required: q.is_required,
                    // Se tiver opções, criamos elas dentro da pergunta!
                    ...(q.options && q.options.length > 0 && {
                        options: {
                            create: q.options.map((optText, idx) => ({
                                option_text: optText,
                                order_index: idx
                            }))
                        }
                    })
                }))
            }
        })
        return {
            survey
        }

    }
}