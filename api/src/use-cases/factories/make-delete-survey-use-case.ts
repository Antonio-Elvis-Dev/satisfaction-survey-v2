import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository"
import { DeleteSurveyUseCase } from "../delete-survey"

export function makeDeleteSurveyUseCase() {

    const surveysRepository = new PrismaSurveyRepository()
    const deleteSurveyUseCase = new DeleteSurveyUseCase(surveysRepository)

    return deleteSurveyUseCase

}