import { PrismaUserRolesRepository } from '@/repositories/prisma/prisma-user-roles-repository';
import { AuthenticateUsecase } from './../authenticate';
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';


export function makeAuthenticateUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const userRolesRepository = new PrismaUserRolesRepository()
    const authenticateUseCase = new AuthenticateUsecase(usersRepository, userRolesRepository)

    return authenticateUseCase
}