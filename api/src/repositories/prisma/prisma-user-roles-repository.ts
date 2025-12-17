import { AppRole, Prisma, UserRole } from "@prisma/client";
import { UserRolesRepository } from "../user-roles-repository";
import { prisma } from "@/lib/prisma";

export class PrismaUserRolesRepository implements UserRolesRepository {


    async update(id: string, data: Prisma.UserUpdateInput): Promise<UserRole> {
        const role = await prisma.userRole.update({
            where: {
                id
            },
            data
        })
        return role
    }


    async findById(id: string): Promise<UserRole | null> {

        const role = await prisma.userRole.findUnique({
            where: {
                id
            }
        })

        return role

    }
    async findByIdUser(userId: string): Promise<UserRole[]> {
        const role = await prisma.userRole.findMany({
            where: {
               user_id: userId
            }
        })

        return role


    }

    async findByUserAndRole(userId: string, role: AppRole): Promise<UserRole | null> {

        return await prisma.userRole.findUnique({
            where: {
                user_id_role: {
                   user_id: userId,
                    role
                }
            }
        })

    }
    async deleteByUserAndRole(userId: string, role: AppRole): Promise<void> {

        await prisma.userRole.delete({
            where: {
                user_id_role: {
                   user_id: userId,
                    role
                }
            }
        })

    }

    async create(data: Prisma.UserRoleCreateInput): Promise<UserRole> {
        return await prisma.userRole.create({
            data
        })
    }
}