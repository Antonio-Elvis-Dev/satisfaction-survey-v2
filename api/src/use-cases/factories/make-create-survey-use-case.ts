import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository"
import { CreateSurveyUseCase } from "../create-survey"


export function makeCreateSurveyUseCase(){
    const surveysRepository = new PrismaSurveyRepository()
    const createSurveyUseCase = new CreateSurveyUseCase(surveysRepository)

    return createSurveyUseCase
}