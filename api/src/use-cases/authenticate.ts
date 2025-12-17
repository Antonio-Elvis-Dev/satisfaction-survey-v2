import { FastifyReply } from 'fastify';
import { UsersRepository } from "@/repositories/users-repository"
import { User, UserRole } from "@prisma/client"
import { InvalidCredentialsError } from "./erros/invalid-credentials-error"
import { compare } from "bcryptjs"
import { UserRolesRepository } from "@/repositories/user-roles-repository"
import { NoRolesAssignedUserError } from './erros/no-roles-assigned-user-error';

interface AuthenticateUseCaseRequest {
    email: string
    password: string
}

interface AuthenticateUseCaseResponse {
   user: User,
   userRoles: UserRole[]
}

export class AuthenticateUsecase {
    constructor(
        private usersRepository: UsersRepository,
        private userRolesRepository: UserRolesRepository
    ) { }

    async execute({ email, password }: AuthenticateUseCaseRequest, reply: FastifyReply): Promise<AuthenticateUseCaseResponse> {

        const user = await this.usersRepository.findByEmail(email)

        if (!user) {
            throw new InvalidCredentialsError()
        }

        const passwordMatch = await compare(password, user.password_hash)
        if (!passwordMatch) {
            throw new InvalidCredentialsError()
        }

        const userRoles = await this.userRolesRepository.findByIdUser(user.id)
        if (!userRoles || userRoles.length === 0) {
            throw new NoRolesAssignedUserError()
        }
        
        return {
            user,
            userRoles
        }
    }
}