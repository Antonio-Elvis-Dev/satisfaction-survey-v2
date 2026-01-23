
import { GetUserProfileUseCase } from "../get-user-profile";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaProfilesRepository } from "@/repositories/prisma/prisma-profiles-repository";

export function makeGetUserProfileUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const profileRespository = new PrismaProfilesRepository()
    const getUserProfileUseCase = new GetUserProfileUseCase(usersRepository,profileRespository)

    return getUserProfileUseCase
}