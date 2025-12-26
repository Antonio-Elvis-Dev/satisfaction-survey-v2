import { SurveysRepository } from "@/repositories/surveys-repository"
import { Survey } from "@prisma/client"
import { ResourceNotFoundError } from "./erros/resource-not-found-error"

interface GetSurveyUseCaseRequest {
    surveyId: string
}

interface GetSurveyUseCaseResponse {
    survey: Survey
}


export class GetSurveyUseCase {
    constructor(private surveyRepository: SurveysRepository) { }

    async execute({ surveyId }: GetSurveyUseCaseRequest): Promise<GetSurveyUseCaseResponse> {

        const survey = await this.surveyRepository.findById(surveyId)

        if (!survey) {
            throw new ResourceNotFoundError()
        }

        return { survey }

    }
}

