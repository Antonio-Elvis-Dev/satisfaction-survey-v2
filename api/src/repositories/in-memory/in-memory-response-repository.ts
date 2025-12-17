import { Response, Prisma } from "@prisma/client";
import { ResponseRepository } from "../response-repository";

export class InMemoryResponseRepository implements ResponseRepository{
    findBySessionId(sessionId: string): Promise<Response[]> {
        throw new Error("Method not implemented.");
    }
    createMany(data: Prisma.ResponseCreateManyInput[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findByQuestionId(questionId: string): Promise<Response[]> {
        throw new Error("Method not implemented.");
    }

}