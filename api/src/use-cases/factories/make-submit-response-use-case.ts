import { PrismaQuestionsRepository } from "@/repositories/prisma/prisma-questions-repository"
import { PrismaResponseSessionsRepository } from "@/repositories/prisma/prisma-response-sessions-repository"
import { PrismaSurveyMetricsRepository } from "@/repositories/prisma/prisma-survey-metrics-repository"
import { SubmitResponseUseCase } from "../submit-response"
import { UpdateSurveyMetricsUseCase } from "../update-survey-metrics"

export function makeSubmitResponseUseCase() {
    // 1. Instanciar os repositórios necessários
    const responseSessionsRepository = new PrismaResponseSessionsRepository()
    const questionsRepository = new PrismaQuestionsRepository()
    const surveyMetricsRepository = new PrismaSurveyMetricsRepository()

    // 2. Instanciar o caso de uso de atualização de métricas
    // Ele precisa do repositório de sessões (para ler) e de métricas (para salvar)
    const updateSurveyMetricsUseCase = new UpdateSurveyMetricsUseCase(
        responseSessionsRepository,
        surveyMetricsRepository
    )

    // 3. Instanciar o caso de uso principal, injetando o atualizador de métricas
    const submitResponseUseCase = new SubmitResponseUseCase(
        responseSessionsRepository,
        questionsRepository,
        updateSurveyMetricsUseCase
    )

    return submitResponseUseCase
}