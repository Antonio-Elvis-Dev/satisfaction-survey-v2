import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository"
import { GetSurveyStatsUseCase } from "../get-survey-stats"

export function makeGetSurveyStatsUseCase(){
    const surveysRepository = new PrismaSurveyRepository()
    const getSurveyStatsUseCase = new GetSurveyStatsUseCase()


    return getSurveyStatsUseCase
}