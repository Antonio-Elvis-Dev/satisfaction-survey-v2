import { Response, Prisma } from "@prisma/client";
import { ResponseRepository } from "../response-repository";
import { prisma } from "@/lib/prisma";

export class PrismaResponseRepository implements ResponseRepository {
    async findBySessionId(sessionId: string): Promise<Response[]> {
        return await prisma.response.findMany({
            where: {
               session_id: sessionId
            }
        })
    }
    async createMany(data: Prisma.ResponseCreateManyInput[]): Promise<void> {
        await prisma.response.createMany({
            data
        })
    }
    async findByQuestionId(questionId: string): Promise<Response[]> {
        return await prisma.response.findMany({
            where: {
               session_id: questionId
            }
        })
    }

}