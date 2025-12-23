import { InvalidCredentialsError } from "@/use-cases/erros/invalid-credentials-error";
import { NoRolesAssignedUserError } from "@/use-cases/erros/no-roles-assigned-user-error";
import { makeAuthenticateUseCase } from "@/use-cases/factories/make-authenticated-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authenticateDobySchema = z.object({
        email: z.email(),
        password: z.string().min(6)
    })

    const { email, password } = authenticateDobySchema.parse(request.body)

    try {
        const authenticateUseCase = makeAuthenticateUseCase()

        const { user, userRoles } = await authenticateUseCase.execute({
            email, password,
        },
            reply
        )

        const mainRole = userRoles[0]?.role
        const token = await reply.jwtSign(
            { role: mainRole },
            {
                sign: {
                    sub: user.id
                }
            }
        )

        return reply.status(200)
            .send({
                message: "Authenticated successfully.",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: mainRole
                }
            })
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            return reply.status(401).send({ message: "Invalid email or password." })
        }

        if (error instanceof NoRolesAssignedUserError) {
            return reply.status(403).send({ message: "User has no roles assigned." })
        }

        throw error
    }
}