import { Question, Prisma } from "@prisma/client";
import { QuestionsRepository } from "../questions-repositorys";

export class InMemoryQuestionsRepository implements QuestionsRepository{
    findById(id: string): Promise<Question | null> {
        throw new Error("Method not implemented.");
    }
    findSurveyId(surveyId: string): Promise<Question[]> {
        throw new Error("Method not implemented.");
    }
    create(data: Prisma.QuestionCreateInput): Promise<Question> {
        throw new Error("Method not implemented.");
    }
    update(id: string, data: Prisma.QuestionUpdateInput): Promise<Question> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}