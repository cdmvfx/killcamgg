import type { AppRouter } from '../server/trpc/router/_app'
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;

export type BuildGetAllResult = RouterOutput['build']['getAll'];

export type BuildGetOneResult = RouterOutput['build']['getOne'];

export type BuildGetOneWithFavorited = (BuildGetOneResult & {
	isFavorited: boolean
})