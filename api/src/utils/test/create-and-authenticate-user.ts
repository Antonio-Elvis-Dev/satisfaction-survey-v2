import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import request from 'supertest'

export async function createAndAuthenticateUser(app: FastifyInstance, isAdmin = false) {

    await prisma.user.create({
        data: {

            email: 'johndoe2@exemple.com',
            passwordHash: await hash('123456', 6),

            roles: {
                create: {
                    role: isAdmin ? 'admin' : 'manager'
                }
            }
        }
    })

    await request(app.server)
        .post('/users')
        .send({
            name: 'John Doe',
            email: 'johndoe2@exemple.com',
            password: '123456'
        })

    const authResponse = await request(app.server).post('/sessions').send({
        email: "johndoe2@exemple.com",
        password: '123456'
    })

    const { token } = authResponse.body

    return { token }
}