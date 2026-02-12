import { UpdateSurveyMetricsUseCase } from './update-survey-metrics';
import { QuestionsRepository } from "@/repositories/questions-repositorys"
import { ResponseSessionsRepository } from "@/repositories/response-sessions-repository"
import { Prisma } from "@prisma/client"

interface SubmitResponseRequest {
    surveyId: string
    respondentId?: string | null
    timeSpentSeconds: number
    answers: {
        questionId: string
        value: string | number
    }[]
}

export class SubmitResponseUseCase {
    constructor(
        private responseSessionRepository: ResponseSessionsRepository,
        private questionsRepository: QuestionsRepository,
        private updateSurveyMetricsUseCase: UpdateSurveyMetricsUseCase
    ) { }

    async execute({ surveyId, respondentId, timeSpentSeconds, answers }: SubmitResponseRequest) {

        const formattedResponses = answers.map(answer => {
            const isNumber = typeof answer.value === 'number';
            const valueStr = answer.value as string;
            const isUUID = typeof answer.value === 'string' && answer.value.length > 30 && answer.value.includes('-');

            return {
                question: { connect: { id: answer.questionId } },
                numeric_response: isNumber ? (answer.value as number) : null,
                ...(isUUID && {
                    selected_option: {
                        connect: { id: valueStr }
                    }
                }), text_response: (!isNumber && !isUUID) ? valueStr : null
            }
        })

        await this.responseSessionRepository.create({
            survey: {
                connect: {
                    id: surveyId
                },
            },

            //TODO: Usamos o spread operator (...) condicional.
            // Se respondentId for null ou undefined, essa linha é ignorada
            // e a chave 'respondent' nem entra no objeto.

            ...(respondentId && {
                respondent: {
                    connect: { id: respondentId }
                }
            }),
            time_spent_seconds: timeSpentSeconds,
            is_complete: true,
            completed_at: new Date(),
            started_at: new Date(), // Adicionado pois é obrigatório no teu type ou banco

            // Criação das respostas aninhadas
            responses: {
                create: formattedResponses
            }
        })
        await this.updateSurveyMetricsUseCase.execute({ surveyId });
        return {};
    }
}