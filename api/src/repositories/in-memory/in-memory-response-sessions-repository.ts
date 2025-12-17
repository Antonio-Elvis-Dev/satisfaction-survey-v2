import { ResponseSession, Prisma } from "@prisma/client";
import { ResponseSessionsRepository } from "../response-sessions-repository";

export class InMemoryResponseSessionsRepository implements ResponseSessionsRepository{
    findById(id: string): Promise<ResponseSession | null> {
        throw new Error("Method not implemented.");
    }
    findByUserAndSurvey(id: string, surveyId: string): Promise<ResponseSession | null> {
        throw new Error("Method not implemented.");
    }
    findAllByUser(userId: string): Promise<ResponseSession[]> {
        throw new Error("Method not implemented.");
    }
    create(data: Prisma.ResponseSessionCreateInput): Promise<ResponseSession> {
        throw new Error("Method not implemented.");
    }
}