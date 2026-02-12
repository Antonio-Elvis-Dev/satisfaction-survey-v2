import { Survey, Prisma } from "@prisma/client";
import { SurveysRepository } from "../survey-repository";
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
                        },

                    }

                }
            },

        })

    }
   async findAll(page: number = 1): Promise<Survey[]> {
  const take = 20
  const pageNumber = Number(page) > 0 ? Number(page) : 1

  return prisma.survey.findMany({
    take,
    skip: (pageNumber - 1) * take,
    orderBy: {
      created_at: 'desc',
    },
    include: {
      _count: {
        select: {
          question: true,
        },
      },
      survey_metrics: {
        select: {
          total_responses: true,
          nps_score: true,
          csat_score: true,
        },
      },
    },
  })
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