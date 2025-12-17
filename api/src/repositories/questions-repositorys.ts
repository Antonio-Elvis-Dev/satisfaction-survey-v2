import { Prisma, Question } from "@prisma/client";

export interface QuestionsRepository {
    findById(id: string): Promise<Question | null>
    findSurveyId(surveyId: string): Promise<Question[]>
    create(data: Prisma.QuestionCreateInput): Promise<Question>
    update(id: string, data: Prisma.QuestionUpdateInput): Promise<Question>
    delete(id: string): Promise<void>


}