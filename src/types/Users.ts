import type { AppRouter } from '../server/trpc/router/_app'
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;

export type UserGetProfileDataResult = RouterOutput['user']['getProfileData'];

export type ReviewFromUserGetProfileDataResult = NonNullable<UserGetProfileDataResult>['reviews'][number];

export type ReviewBuildFromUserGetProfileDataResult = ReviewFromUserGetProfileDataResult['build'];