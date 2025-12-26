import { Survey, Prisma } from "@prisma/client";
import { SurveysRepository } from "../surveys-repository";
import { prisma } from "@/lib/prisma";

export class PrismaSurveyRepository implements SurveysRepository {

    async findById(id: string): Promise<Survey | null> {
        return await prisma.survey.findUnique({
            where: {
                id
            },
            include: {
                question: {
                    orderBy: {
                        order_index: 'asc'
                    },
                    include: {
                        options: {
                            orderBy: {
                                order_index: 'asc'
                            }
                        }
                    }
                }
            }
        })

    }
    async findAll(): Promise<Survey[]> {
        return await prisma.survey.findMany()
    }
    async findActivate(): Promise<Survey[]> {

        return await prisma.survey.findMany({
            where: {
                status: 'active'
            }
        })

    }
    async create(data: Prisma.SurveyCreateInput): Promise<Survey> {

        return await prisma.survey.create({
            data
        })

    }
    async update(id: string, data: Prisma.SurveyUpdateInput): Promise<Survey> {
        return await prisma.survey.update({
            where: {
                id
            },
            data
        })
    }
    async delete(id: string): Promise<void> {
        await prisma.survey.delete({
            where: {
                id
            }
        })
    }

}