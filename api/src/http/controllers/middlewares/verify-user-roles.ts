import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';

export function verifyUserRole(roleToVerify:'ADMIN'|'VIEWER'|'MANAGER') {

   return async (request: FastifyRequest, reply: FastifyReply) => {
        
        const { role } = request.user
        
        if (role !== 'ADMIN') {
            
            return reply.status(401).send({ message: 'Unauthorized.' })
        }
        
    }
}