import {  Prisma } from '@prisma/client';
import { ProfilesRepository } from '../profiles-repository';
import { prisma } from '@/lib/prisma';

export class PrismaProfilesRepository implements ProfilesRepository {

    async findByUserId(id: string) {
        const profile = await prisma.profile.findUnique({
            where: {
                id
            }
        })
        return profile
    }
    async create(data: Prisma.ProfileCreateInput) {
        const profile = await prisma.profile.create({
            data
        })

        return profile
    }
    async update(id: string, data: Prisma.ProfileCreateInput) {

        const profile = await prisma.profile.update({
            where: {
                id
            },
            data
        })

        return profile
    }

}