

import { PrismaQuestionsRepository } from '@/repositories/prisma/prisma-questions-repository';
import { PrismaResponseSessionsRepository } from '@/repositories/prisma/prisma-response-sessions-repository';
import { SubmitResponseUseCase } from '../submit-response';

export function makeSubmitResponseUseCase(){
    const responseSessionsRepository = new PrismaResponseSessionsRepository()
    const questionsRepository = new PrismaQuestionsRepository()

    const submitResponse = new SubmitResponseUseCase(responseSessionsRepository,questionsRepository)

    return submitResponse
}