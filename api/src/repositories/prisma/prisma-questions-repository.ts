import { Prisma, Question } from '@prisma/client';
import { QuestionsRepository } from '../questions-repositorys';
import { prisma } from '@/lib/prisma';

export class PrismaQuestionsRepository implements QuestionsRepository {
    async findById(id: string): Promise<Question | null> {
        return await prisma.question.findUnique({
            where: {
                id
            }
        })
    }
    async findSurveyId(surveyId: string): Promise<Question[]> {
        return await prisma.question.findMany({
            where: {
               survey_id: surveyId
            }
        })
    }
    async create(data: Prisma.QuestionCreateInput): Promise<Question> {

        return await prisma.question.create({
            data
        })
    }
    async update(id: string, data: Prisma.QuestionUpdateInput): Promise<Question> {
        return await prisma.question.update({
            where: {
                id
            },
            data
        })
    }
    async delete(id: string): Promise<void> {
        await prisma.question.delete({
            where: {
                id
            }
        })
    }

}