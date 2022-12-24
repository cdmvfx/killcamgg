import type { AppRouter } from '../server/trpc/router/_app'
import type { inferRouterOutputs } from '@trpc/server';
import type { Build, User } from '@prisma/client';

type RouterOutput = inferRouterOutputs<AppRouter>;

export type UserGetProfileDataResult = RouterOutput['user']['getProfileData'];

export type UserWithFavorites = User & {
	favorites: Build[];
}