import { Prisma, UserRole } from "@prisma/client"

export interface UserRolesRepository {
   findById(id: string): Promise<UserRole | null>
   findByIdUser(userId: string): Promise<UserRole[]>
   findByUserAndRole(userId: string, role: string): Promise<UserRole | null>
   create(data: Prisma.UserRoleCreateInput): Promise<UserRole>
   update(id: string, data: Prisma.UserUpdateInput): Promise<UserRole>
   deleteByUserAndRole(userId: string, role: string): Promise<void>
}