import { FastifyRequest, FastifyReply } from "fastify";
import { z } from 'zod'
import { UserAlreadyExistsError } from "@/use-cases/erros/user-already-exists-error";
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-use-case";
import { GetUserProfileUseCase } from "@/use-cases/get-user-profile";
import { makeGetUserProfileUseCase } from "@/use-cases/factories/make-get-user-profile-use-case";
import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";

export async function profile(request: FastifyRequest, reply: FastifyReply) {

    const userId = request.user.sub

    const getProfile = makeGetUserProfileUseCase()

    try {
        const { user } = await getProfile.execute({
            userId,
        })

        return reply.status(200).send(user)

    } catch (err) {

        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: err.message })
        }
        throw err
    }

}