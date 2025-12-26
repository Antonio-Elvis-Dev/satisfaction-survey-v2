import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { GetSurveyUseCase } from "../get-survey";

export function makeGetSurveyUseCase() {
    const surveysRepository = new PrismaSurveyRepository()
    const getSurveyUseCase = new GetSurveyUseCase(surveysRepository)

    return getSurveyUseCase
}