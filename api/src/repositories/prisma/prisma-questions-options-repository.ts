import { QuestionOption, Prisma } from '@prisma/client';
import { QuestionsOptionsRepository } from '../questions-options-repository';
import { prisma } from '@/lib/prisma';

export class PrismaQuestionsOptionsRepository implements QuestionsOptionsRepository {
    async findById(id: string): Promise<QuestionOption | null> {
        const question = await prisma.questionOption.findUnique({
            where: {
                id
            }
        })
        return question
    }
    async findByQuestionId(questionId: string): Promise<QuestionOption[]> {
        const questions = await prisma.questionOption.findMany({
            where: {
               question_id: questionId
            }
        })
        return questions
    }
    async create(data: Prisma.QuestionOptionCreateInput): Promise<QuestionOption> {
        return await prisma.questionOption.create({
            data
        })
    }
    async createMany(data: Prisma.QuestionOptionCreateManyInput[]): Promise<void> {
        await prisma.questionOption.createMany({
            data
        })
    }
    async update(id: string, data: Prisma.QuestionOptionUpdateInput): Promise<QuestionOption> {

        return await prisma.questionOption.update({
            where: {
                id
            },
            data
        })

    }
    async delete(id: string): Promise<void> {
        await prisma.questionOption.delete({
            where: {
                id
            }
        })
    }
    async deleteByQuestionId(questionId: string): Promise<void> {
        await prisma.questionOption.deleteMany({
            where: {
               question_id: questionId
            }
        })
    }

}