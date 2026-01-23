import { Prisma, User } from "@prisma/client"

export interface UsersRepository {
    findById(id: string): Promise<User | null>
    findByEmail(email: string): Promise<User | null>
    findByAll(): Promise<User[]>
    create(data:{full_name:string, email:string, password_hash:string}): Promise<User>
    update(id: string, data: {full_name?:string, password_hash?:string}): Promise<User>
    delete(id: string): Promise<void>
}


