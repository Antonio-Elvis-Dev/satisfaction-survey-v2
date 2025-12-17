import { Prisma, Profile } from "@prisma/client";

export interface ProfilesRepository {
    findByUserId(id: string): Promise<Profile | null>
    create(data: Prisma.ProfileCreateInput): Promise<Profile>
    update(id: string, data: Prisma.ProfileCreateInput): Promise<Profile>
}
