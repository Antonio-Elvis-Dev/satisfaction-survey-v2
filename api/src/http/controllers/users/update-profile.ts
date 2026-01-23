import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { UpdateProfileUseCase } from "@/use-cases/update-profile";
import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";

export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const updateBodySchema = z.object({
        full_name: z.string().optional(),
        password: z.string().min(6).optional(),
    })

    const { full_name, password } = updateBodySchema.parse(request.body)
    const userId = request.user.sub

    const usersRepository = new PrismaUsersRepository()
    const updateProfileUseCase = new UpdateProfileUseCase(usersRepository)

    const data: {
        userId: string
        full_name?: string
        password?: string
    } = { userId }


    if (full_name !== undefined) {

    }
    if (password !== undefined) {
        data.password = password
    }

    try {
        await updateProfileUseCase.execute(data)

        return reply.status(204).send() // Sucesso sem conteúdo

    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: 'User not found.' })
        }
        throw err
    }
}