import { FastifyRequest, FastifyReply } from "fastify";
import {  z } from 'zod'
import { UserAlreadyExistsError } from "@/use-cases/erros/user-already-exists-error";
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-use-case";

export async function assignRole(request: FastifyRequest, reply: FastifyReply) {
    const assignRoleBodySchema = z.object({
       

    })

    const { } = assignRoleBodySchema.parse(request.body)
    try {
        const registerUseCase = makeRegisterUseCase()

        
    } catch (err) {
        if (err instanceof UserAlreadyExistsError) {
            return reply.status(409).send({ message: err.message })
        }
        throw err
    }

    return reply.status(201).send()

}