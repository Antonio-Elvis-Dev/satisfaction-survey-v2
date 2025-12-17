import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { RegisterUsecase } from '../register';


export function makeRegisterUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const registerUseCase = new RegisterUsecase(usersRepository)

    return registerUseCase
}