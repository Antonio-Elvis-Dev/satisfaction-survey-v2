import { Prisma, SurveyMetrics } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SurveyMetricsRepository } from "../survey-metrics-repository";

export class PrismaSurveyMetricsRepository implements SurveyMetricsRepository {
    
    async save(data: Prisma.SurveyMetricsUncheckedCreateInput): Promise<SurveyMetrics> {
        // O data.survey_id é obrigatório. Vamos extraí-lo para usar no 'where'.
        const { survey_id, ...rest } = data;

        return await prisma.surveyMetrics.upsert({
            where: {
                survey_id: survey_id
            },
            update: {
                ...rest,
                updated_at: new Date()
            },
            create: {
                survey_id: survey_id,
                ...rest
            }
        });
    }
}