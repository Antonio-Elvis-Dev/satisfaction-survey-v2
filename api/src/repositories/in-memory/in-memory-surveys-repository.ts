import { Survey, Prisma } from '@prisma/client';
import { SurveysRepository } from './../surveys-repository';
import { randomUUID } from 'crypto';
import { da } from 'zod/v4/locales';
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
            user_id:data.id ?? null,
            title: data.title,
            description: data.description ?? null,
            status: data.status ?? 'draft',
            created_by_id: data.created_by.connect?.id ?? randomUUID(),
            created_at: new Date(),
            updated_at: new Date(),
            published_at: new Date(),
            closed_at: new Date(),
            allow_anonymous: data.allow_anonymous ?? false,
            show_progress_bar: data.show_progress_bar ?? true,
            thank_you_message: data.thank_you_message ?? '',
            total_responses: data.total_responses ?? 0,
            is_template: data.is_template ?? false,
            duplicated_from_id: (data.duplicated_from as any)?.connect?.id ?? null,

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