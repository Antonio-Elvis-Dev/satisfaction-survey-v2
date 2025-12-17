import { Prisma, QuestionOption } from "@prisma/client"

export interface QuestionsOptionsRepository {
  findById(id: string): Promise<QuestionOption | null>
  findByQuestionId(questionId: string): Promise<QuestionOption[]>
  create(data: Prisma.QuestionOptionCreateInput): Promise<QuestionOption>
  createMany(data: Prisma.QuestionOptionCreateManyInput[]): Promise<void>
  update(id: string, data: Prisma.QuestionOptionUpdateInput): Promise<QuestionOption>
  delete(id: string): Promise<void>
  deleteByQuestionId(questionId: string): Promise<void>
}
