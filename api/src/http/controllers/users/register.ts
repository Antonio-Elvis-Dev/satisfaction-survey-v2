import { FastifyRequest, FastifyReply } from "fastify";
import { z } from 'zod'
import { UserAlreadyExistsError } from "@/use-cases/erros/user-already-exists-error";
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-use-case";

export async function register(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
        full_name: z.string().min(3),
        email: z.email(),
        password: z.string().min(6),

    })

    const { email, password, full_name } = registerBodySchema.parse(request.body)
    try {
        const registerUseCase = makeRegisterUseCase()
        // const profileUseCase = make
        await registerUseCase.execute({
            email,
            password,
            full_name

        })
    } catch (err) {
        if (err instanceof UserAlreadyExistsError) {
            return reply.status(409).send({ message: err.message })
        }
        throw err
    }

    return reply.status(201).send()

}