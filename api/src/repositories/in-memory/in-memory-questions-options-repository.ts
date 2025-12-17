import { QuestionOption, Prisma } from "@prisma/client";
import { QuestionsOptionsRepository } from "../questions-options-repository";

export class InMemoryQuestionsOptionsRepository implements QuestionsOptionsRepository{
    findById(id: string): Promise<QuestionOption | null> {
        throw new Error("Method not implemented.");
    }
    findByQuestionId(questionId: string): Promise<QuestionOption[]> {
        throw new Error("Method not implemented.");
    }
    create(data: Prisma.QuestionOptionCreateInput): Promise<QuestionOption> {
        throw new Error("Method not implemented.");
    }
    createMany(data: Prisma.QuestionOptionCreateManyInput[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    update(id: string, data: Prisma.QuestionOptionUpdateInput): Promise<QuestionOption> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deleteByQuestionId(questionId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}