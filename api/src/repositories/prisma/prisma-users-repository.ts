import { AppRole, Prisma } from "@prisma/client";
import { UsersRepository } from "../users-repository";
import { prisma } from "@/lib/prisma";

export class PrismaUsersRepository implements UsersRepository {

    async findByAll() {

        return await prisma.user.findMany()

    }
    async update(id: string, data: { name?: string, password_hash?: string }) {

        const updateData: Prisma.UserUpdateInput = {}

        if (data.password_hash) {
            updateData.password_hash = data.password_hash
        }

        if (data.name) {
            updateData.profile = {
                update: {
                    full_name: data.name
                }
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                profile: true
            }
        })
        return user
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
            },
            include:{
                profile: true
            }
        })
        return user
    }

    async findByEmail(email: string) {

        const user = await prisma.user.findUnique({
            where: {
                email
            },
            include: {
                profile: true
            }
        })
        return user
    }

    async create(data: { email: string, password_hash: string, full_name: string }) {

        const role: AppRole = data.email === 'admin@teste.com' ? 'admin' : "viewer"

        return await prisma.$transaction(async (tx) => {

            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password_hash: data.password_hash,
                }
            })

            await tx.profile.create({
                data: {
                    id: user.id,
                    full_name: data.full_name,
                    avatar_url: null
                }
            })

            await tx.userRole.create({
                data: {
                    user_id: user.id,
                    role,
                    created_by_id: user.id
                }
            })
            return user

        })
    }

}