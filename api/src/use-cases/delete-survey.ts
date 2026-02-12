import { SurveysRepository } from "@/repositories/survey-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";

interface DeleteSurveyRequest {
    surveyId: string;
}

export class DeleteSurveyUseCase {
    constructor(private surveysRepository: SurveysRepository) {}

    async execute({ surveyId }: DeleteSurveyRequest): Promise<void> {
        // 1. Verifica se existe
        const survey = await this.surveysRepository.findById(surveyId)

        if (!survey) {
            throw new ResourceNotFoundError()
        }

        // 2. Deleta (Sem verificar created_by_id, permitindo que qualquer um delete)
        await this.surveysRepository.delete(surveyId)
    }
}