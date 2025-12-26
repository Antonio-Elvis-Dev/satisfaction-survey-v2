import { PrismaSurveyRepository } from "@/repositories/prisma/prisma-survey-repository";
import { FetchSurveysUseCase } from "../fetch-surveys";

export function makeFetchSurveyUseCase(){
    const surveyRepository = new PrismaSurveyRepository()
    const fetchSurveyUseCase = new FetchSurveysUseCase(surveyRepository)

    return fetchSurveyUseCase
}