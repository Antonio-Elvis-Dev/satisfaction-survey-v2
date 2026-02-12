import { Prisma,  SurveyMetrics } from "@prisma/client";

export interface SurveyMetricsRepository {
save(data: Prisma.SurveyMetricsUncheckedCreateInput): Promise<SurveyMetrics>}