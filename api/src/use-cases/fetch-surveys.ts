import { SurveysRepository } from "@/repositories/surveys-repository";
import { Survey } from "@prisma/client";

interface FetchSurveyResponse {
    surveys: Survey[]
}



export class FetchSurveysUseCase {

    constructor(private surveyRepository: SurveysRepository) { }

    async execute(): Promise<FetchSurveyResponse> {
        const surveys = await this.surveyRepository.findAll()


        return { surveys }
    }

}