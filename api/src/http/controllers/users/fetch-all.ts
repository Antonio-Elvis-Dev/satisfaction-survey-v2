import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";

export async function fetchAll(request: FastifyRequest, reply: FastifyReply) {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            created_at: true,
            profile: { 
                select: { 
                    full_name: true 
                } 
            },
            // 👇 AQUI ESTAVA O ERRO: No teu schema chama-se 'roles', não 'user_roles'
            roles: { 
                // Como 'roles' é um array de UserRole, e UserRole tem um campo 'role' (enum AppRole)
                // Não precisamos de 'include: { role: true }' porque 'role' é um campo escalar (enum), não uma tabela.
                select: {
                    role: true
                }
            }
        }
    });
    
    const formattedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.profile?.full_name ?? 'Sem nome',
        // 👇 Acessamos 'roles' e pegamos o valor do enum
        role: u.roles[0]?.role || 'viewer', 
        createdAt: u.created_at
    }));

    return reply.send(formattedUsers);
}