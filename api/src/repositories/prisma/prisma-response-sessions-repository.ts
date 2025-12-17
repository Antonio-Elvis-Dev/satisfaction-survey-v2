import { ResponseSession, Prisma } from "@prisma/client";
import { ResponseSessionsRepository } from "../response-sessions-repository";
import { prisma } from "@/lib/prisma";

export class PrismaResponseSessionsRepository implements ResponseSessionsRepository {

    async findById(id: string): Promise<ResponseSession | null> {
        return await prisma.responseSession.findUnique({
            where: { id }
        })
    }
    async findByUserAndSurvey(id: string, surveyId: string): Promise<ResponseSession | null> {
        return await prisma.responseSession.findFirst({
            where: {
                id,
                survey_id: surveyId
            }
        })
    }
    async findAllByUser(userId: string): Promise<ResponseSession[]> {
        return await prisma.responseSession.findMany({
            where: {

                respondent_id: userId
            }
        })
    }
    async create(data: Prisma.ResponseSessionCreateInput): Promise<ResponseSession> {

        return await prisma.responseSession.create({
            data
        })
    }

}