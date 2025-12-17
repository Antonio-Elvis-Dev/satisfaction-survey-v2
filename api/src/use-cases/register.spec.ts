import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository';
import { beforeEach, describe, expect, it } from "vitest";
import { RegisterUsecase } from './register';
import { compare } from 'bcryptjs';
import { UserAlreadyExistsError } from './erros/user-already-exists-error';

let usersRepository: InMemoryUsersRepository
let sut: RegisterUsecase

describe('Register Use Case', () => {

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new RegisterUsecase(usersRepository)
    })
    it('should be able to register', async () => {

        const { user } = await sut.execute({
            email: 'elvis@teste.com',
            password: '123123'
        })

        expect(user.id).toEqual(expect.any(String))

    })

    it('should hash user password upon registration ', async () => {

        const { user } = await sut.execute({
            email: 'elvis@teste.com',
            password: '123123'
        })

        const isPasswordCorrectlyHashed = await compare(
            '123123',
            user.passwordHash
        )

        expect(isPasswordCorrectlyHashed).toBe(true)
    })

    it('should not be able to register with same email twice', async () => {



        const email = "johyy@example"

        await sut.execute({
            email, password: '123456'
        })
        await expect(() =>
            sut.execute({
                email, password: '123456'
            })
        ).rejects.toBeInstanceOf(UserAlreadyExistsError)

    })
})