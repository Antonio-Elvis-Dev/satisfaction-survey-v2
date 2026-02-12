import { Prisma, ResponseSession } from "@prisma/client";

export interface ResponseSessionsRepository {
    findById(id: string): Promise<ResponseSession | null>
    findManyBySurveyId(id: string): Promise<ResponseSession[]>
    findByUserAndSurvey( surveyId: string): Promise<ResponseSession | null>
    findAllByUser(userId: string): Promise<ResponseSession[]>
    create(data: Prisma.ResponseSessionCreateInput): Promise<ResponseSession>
    
}