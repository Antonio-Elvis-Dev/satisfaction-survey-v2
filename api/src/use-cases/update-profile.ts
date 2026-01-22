import { UsersRepository } from "@/repositories/users-repository";
import { hash } from "bcryptjs";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";

interface UpdateProfileUseCaseRequest {
    userId: string;
    name?: string;
    password?: string;
}

export class UpdateProfileUseCase {
    constructor(private usersRepository: UsersRepository) { }
    async execute({ userId, name, password }: UpdateProfileUseCaseRequest) {
        // 1. Verifica se a pesquisa existe (e permissão global ou do usuário)
        const user = await this.usersRepository.findById(userId)

        if (!user) {
            throw new ResourceNotFoundError()
        }

        const updateData: {
            name?: string
            password_hash?: string
        } = {}

        if (name) {
            updateData.name = name
        }
        if (password) {
            updateData.password_hash = await hash(password, 6)

        }

        const updatedUser = await this.usersRepository.update(userId,
            updateData
        );

        return {
            user: updatedUser
        }

    }
}