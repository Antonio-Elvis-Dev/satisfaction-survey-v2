import { ResponseSession, Prisma } from "@prisma/client";
import { ResponseSessionsRepository } from "../response-sessions-repository";
import { prisma } from "@/lib/prisma";

export class PrismaResponseSessionsRepository implements ResponseSessionsRepository {

    async create(data: Prisma.ResponseSessionCreateInput): Promise<ResponseSession> {

        return await prisma.responseSession.create({
            data
        })

    }

    async findById(id: string): Promise<ResponseSession | null> {
        return await prisma.responseSession.findUnique({
            where: { id },
            include: {
                responses: {
                    include: {
                        question: true
                    }
                }
            }

        })
    }


    async findByUserAndSurvey(surveyId: string): Promise<ResponseSession | null> {
        throw new Error("Method not implemented.");
    }


    async findAllByUser(userId: string): Promise<ResponseSession[]> {
        return await prisma.responseSession.findMany({
            where: {

                respondent_id: userId
            }
        })
    }

    async findManyBySurveyId(id: string): Promise<ResponseSession[]> {
        const sessions = await prisma.responseSession.findMany({
            where: { survey_id: id },
            include: {
                responses: {
                    include: {
                        question: true // Importante para sabermos o TYPE (nps/rating)
                    }
                },
                respondent: true
            }
        })

        // MUDANÇA 2: Retornamos a variável direta, sem criar um objeto { sessions }
        return sessions
    }
}