import { Survey, Prisma } from '@prisma/client';
import { SurveysRepository } from './../surveys-repository';
import { randomUUID } from 'crypto';
export class InMemorySurveysRepository implements SurveysRepository {

    public items: Survey[] = []

    async findById(id: string): Promise<Survey | null> {

        const survey = this.items.find(item => item.id === id)
        if (!survey) {
            return null
        }
        return survey

    }
    async findAll(): Promise<Survey[]> {

        return this.items
    }
    async findActivate(): Promise<Survey[]> {

        const surveyActives = this.items.filter(item => item.status === 'active')

        return surveyActives

    }
    async create(data: Prisma.SurveyCreateInput): Promise<Survey> {
        const survey: Survey = {

            id: randomUUID(),
            title: data.title,
            description: data.description ?? null,
            status: data.status ?? 'draft',
            createdById: data.createdBy.connect?.id ?? randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            publishedAt: new Date(),
            closedAt: new Date(),
            allowAnonymous: data.allowAnonymous ?? false,
            showProgressBar: data.showProgressBar ?? true,
            thankYouMessage: data.thankYouMessage ?? '',
            totalResponses: data.totalResponses ?? 0,
            isTemplate: data.isTemplate ?? false,
            duplicatedFromId: (data.duplicatedFrom as any)?.connect?.id ?? null,

        }
        this.items.push(survey)
        return survey
    }
    async update(id: string, data: Prisma.SurveyUpdateInput): Promise<Survey> {
        const index = this.items.findIndex((item) => item.id === id)
        if (index === -1) {
            throw new Error(`Survey with id ${id} not found`)
        }

        const oldSurvey = this.items[index]
        const normalizedData: any = {}

        // Normaliza campos { set: value } para o valor direto
        for (const [key, value] of Object.entries(data)) {
            normalizedData[key as keyof Prisma.SurveyUpdateInput] =
                typeof value === 'object' && value !== null && 'set' in value
                    ? (value as any).set
                    : (value as any)
        }

        const updatedItem: Survey = {
            ...oldSurvey,
            ...normalizedData,

            // Atualiza timestamp
            updatedAt: new Date(),
        }

        this.items[index] = updatedItem
        return updatedItem
    }
    async delete(id: string): Promise<void> {

        const index = this.items.findIndex(item => item.id === id)
        if (index >= 0) {
            this.items.splice(index, 1)
        }

    }

}