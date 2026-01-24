import { UsersRepository } from "@/repositories/users-repository";
import { ResourceNotFoundError } from "./erros/resource-not-found-error";
import { ProfilesRepository } from "@/repositories/profiles-repository";

interface GetUserProfileUseCaseRequest {
  userId: string;
}

interface GetUserProfileUseCaseResponse {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string
  };
}

export class GetUserProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private profileRepository: ProfilesRepository
  ) { }

  async execute({ userId }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {

    const user = await this.usersRepository.findById(userId);
    const profile = await this.profileRepository.findByUserId(userId);

    const userWithRoles = user as any;
    const role = userWithRoles.roles?.[0]?.role ?? 'viewer';

    if (!user) {
      throw new ResourceNotFoundError();
    }

    return {
      user: {
        id: user.id,
        full_name: profile?.full_name ?? '',
        email: user.email,
        avatar_url: profile?.avatar_url ?? null,
        role
      },
    };
  }
}