import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository"
import { GetDashboardStatsUseCase } from "../get-dashboard-stats"


export function makeGetDashboardStatsUseCase() {

    const surveysRepository = new PrismaSurveyRepository()
    const getDashboardStatsUseCase = new GetDashboardStatsUseCase(surveysRepository)

    return getDashboardStatsUseCase

}