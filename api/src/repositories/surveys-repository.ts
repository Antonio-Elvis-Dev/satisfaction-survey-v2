import { Prisma, Survey } from "@prisma/client";

export interface SurveysRepository {
    findById(id: string): Promise<Survey | null>
    findAll(): Promise<Survey[]>
    findActivate(): Promise<Survey[]>
    create(data: Prisma.SurveyCreateInput): Promise<Survey>
    update(id: string, data: Prisma.SurveyUpdateInput): Promise<Survey>
    delete(id: string): Promise<void>
}