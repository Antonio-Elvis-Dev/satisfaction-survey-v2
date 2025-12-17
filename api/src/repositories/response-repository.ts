import { Prisma, Response } from "@prisma/client";

export interface ResponseRepository {
    findBySessionId(sessionId: string): Promise<Response[]>
    createMany(data: Prisma.ResponseCreateManyInput[]): Promise<void>
    findByQuestionId(questionId: string): Promise<Response[]>
}