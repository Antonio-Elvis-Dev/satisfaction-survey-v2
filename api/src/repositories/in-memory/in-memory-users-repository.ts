import { User, Prisma } from "@prisma/client";
import { UsersRepository } from "../users-repository";
import { randomUUID } from "crypto";

export class InMemoryUsersRepository implements UsersRepository {
    public items: User[] = []


    async findByAll(): Promise<User[]> {
        return this.items
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        const index = this.items.findIndex(item => item.id === id)

        const oldUser = this.items[index]

        const normalizedData: any = {}

        for (const key in data) {
            const value = data[key as keyof Prisma.UserUpdateInput]
            normalizedData[key] = typeof value === 'object' && value !== null && 'set' in value ? (value as any).set : value
        }

        const updateItem = {
            ...oldUser,
            ...normalizedData
        }

        this.items[index] = updateItem
        return updateItem

    }

    async delete(id: string): Promise<void> {
        const index = this.items.findIndex(item => item.id === id)
        if (index >= 0) {
            this.items.splice(index, 1)
        }
    }


    async findById(id: string) {

        const user = this.items.find(item => item.id === id)

        if (!user) {
            return null
        }
        return user

    }
    async findByEmail(email: string) {

        const user = this.items.find(item => item.email === email)
        if (!user) return null

        return user

    }
    async create(data: Prisma.UserCreateInput) {

        const user = {
            id: randomUUID(),
            email: data.email,
            passwordHash: data.passwordHash,
            createdAt: new Date(),
            updatedAt: new Date()

        }
        this.items.push(user)
        return user
    }

}