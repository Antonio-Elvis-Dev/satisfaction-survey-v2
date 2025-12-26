import { UsersRepository } from "@/repositories/users-repository";
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from "./erros/user-already-exists-error";
import { User } from "@prisma/client";

interface RegisterUseCaseRequest {
    full_name: string
    email: string
    password: string
 
}

interface RegisteUseCaseResponse {
    user: any

}

export class RegisterUsecase {
    constructor(private usersRepository: UsersRepository) { }

    async execute({ email, password, full_name }: RegisterUseCaseRequest): Promise<RegisteUseCaseResponse> {

        const password_hash = await hash(password, 6)

        const userWithSameEmail = await this.usersRepository.findByEmail(email)

        if (userWithSameEmail) {
            throw new UserAlreadyExistsError()
        }

        const user = await this.usersRepository.create(
            {
                email,
                password_hash,
                full_name
            }
        )

        return { user }
    }
}