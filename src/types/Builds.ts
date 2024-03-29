import type { RouterOutputs } from "../utils/trpc";

export type BuildGetAllResult = RouterOutputs['build']['getAll'];

export type BuildFromBuildGetAllResult = NonNullable<BuildGetAllResult>['items'][number];

export type BuildGetOneResult = RouterOutputs['build']['getOne'];