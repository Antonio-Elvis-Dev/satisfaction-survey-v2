import { AppRole, Prisma } from "@prisma/client";
import { UsersRepository } from "../users-repository";
import { prisma } from "@/lib/prisma";

export class PrismaUsersRepository implements UsersRepository {

    async findByAll() {

        return await prisma.user.findMany()

    }
    async update(id: string, data: Prisma.UserUpdateInput) {

        return await prisma.user.update({
            where: {
                id
            },
            data

        })

    }
    async delete(id: string) {
        await prisma.user.delete({
            where: {
                id
            }
        })

    }

    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })
        return user
    }

    async findByEmail(email: string) {

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        return user
    }

    async create(data: Prisma.UserCreateInput) {

        let role: AppRole = 'admin'

        const user = await prisma.user.create({
            data
        })

        if (user.email !== 'admin@teste.com') {
            role = 'viewer'
        }

        await prisma.userRole.create({
            data: {
                user_id: user.id,
                role,
                created_by_id: user.id
            }
        })

        return user
    }


}