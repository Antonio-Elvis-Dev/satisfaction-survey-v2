import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository"
import { UpdateSurveyUseCase } from "../update-survey"

export function makeUpdateSurveyUseCase() {
    const surveysRepository = new PrismaSurveyRepository()
    const updateSurveyUseCase = new UpdateSurveyUseCase(surveysRepository)

    return updateSurveyUseCase
}