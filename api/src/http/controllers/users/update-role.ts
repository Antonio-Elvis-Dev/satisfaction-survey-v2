import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

// Exemplo de como seria o controller no backend
export async function updateRole(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({ id: z.string().uuid() })
    const bodySchema = z.object({ role: z.enum(['admin', 'manager', 'viewer']) })

    const { id } = paramsSchema.parse(request.params)
    const { role } = bodySchema.parse(request.body)

 // TODO: fazer os demais arquivos useCase, make...

    return reply.status(204).send()
}