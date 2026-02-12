import { SurveysRepository } from "@/repositories/survey-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";
import { prisma } from "@/lib/prisma";

interface UpdateSurveyStatusRequest {
    surveyId: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
}

export class UpdateSurveyStatusUseCase {
    constructor(private surveysRepository: SurveysRepository) {}

    async execute({ surveyId, status }: UpdateSurveyStatusRequest) {
        const survey = await this.surveysRepository.findById(surveyId);

        if (!survey) {
            throw new ResourceNotFoundError();
        }

        const dataToUpdate: any = { status };

        // Lógica automática de datas
        if (status === 'active' && !survey.published_at) {
            dataToUpdate.published_at = new Date();
        }
        
        if (status === 'completed') {
            dataToUpdate.closed_at = new Date();
        }

        // Atualização direta no Prisma (mais simples para este caso pontual)
        await prisma.survey.update({
            where: { id: surveyId },
            data: dataToUpdate
        });
    }
}