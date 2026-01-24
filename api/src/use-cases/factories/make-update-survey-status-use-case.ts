import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository"
import { UpdateSurveyStatusUseCase } from "../update-survey-status"

export function makeUpdateSurveyStatusUseCase() {
      const surveysRepository = new PrismaSurveyRepository()
        const updateSurveyStatusUseCase = new UpdateSurveyStatusUseCase(surveysRepository)

    return updateSurveyStatusUseCase
}