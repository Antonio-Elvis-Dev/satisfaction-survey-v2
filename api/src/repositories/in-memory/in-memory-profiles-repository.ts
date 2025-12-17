import { Profile, Prisma } from "@prisma/client";
import { ProfilesRepository } from "../profiles-repository";

export class InMemoryProfilesRepository implements ProfilesRepository {

    public items: Profile[] = []


    async findByUserId(id: string): Promise<Profile | null> {

        const profile = this.items.find(item => item.id === id)

        if (!profile) {
            return null

        }
        return profile

    }
    async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
        throw new Error("Method not implemented.");
    }
    async update(id: string, data: Prisma.ProfileCreateInput): Promise<Profile> {
        throw new Error("Method not implemented.");
    }

}