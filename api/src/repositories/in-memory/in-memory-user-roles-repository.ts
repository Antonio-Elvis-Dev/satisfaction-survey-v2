import { UserRole, Prisma, AppRole } from "@prisma/client";
import { UserRolesRepository } from "../user-roles-repository";
import { randomUUID } from "crypto";

export class InMemoryUserRolesRepository implements UserRolesRepository {

    public items: UserRole[] = []

    async findById(id: string): Promise<UserRole | null> {
        const userRoles = this.items.find(item => item.id === id)

        if (!userRoles) {
            return null
        }
        return userRoles
    }
    async findByIdUser(userId: string): Promise<UserRole[]> {
        const userRole = this.items.filter(item => item.user_id === userId)

        return userRole
    }

    async findByUserAndRole(userId: string, role: string): Promise<UserRole | null> {

        const userRole = this.items.find(item => item.user_id === userId && item.role === role)

        if (!userRole) {
            return null
        }
        return userRole
    }
    async create(data: Prisma.UserRoleCreateInput): Promise<UserRole> {
        if (!data.role) {
            throw new Error("Role is required to create a UserRole")
        }
        const userRole: UserRole = {
            id: randomUUID(),
            user_id: data.user.connect?.id ?? randomUUID(),
            role: data.role,
            created_at: new Date(),
            created_by_id: data.created_by?.connect?.id ?? null
        }
        this.items.push(userRole)
        return userRole
    }
    async update(id: string, data: Prisma.UserRoleUpdateInput): Promise<UserRole> {

        const index = this.items.findIndex(item => item.id === id)

        const oldRole = this.items[index]

        const normalizedData: any = {}

        for (const key in data) {
            const value = data[key as keyof Prisma.UserRoleUpdateInput]
            normalizedData[key] = typeof value === 'object' && value !== null && 'set' in value ? (value as any).set : value
        }

        const updateItem = {
            ...oldRole,
            ...normalizedData
        }

        this.items[index] = updateItem
        return updateItem
    }
    async deleteByUserAndRole(userId: string, role: string): Promise<void> {
        const index = this.items.findIndex(item => item.user_id === userId && item.role === role)
        if (index >= 0) {
            this.items.splice(index, 1)
        }
    }

}

