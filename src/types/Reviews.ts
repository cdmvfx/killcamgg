import type { RouterOutputs } from "../utils/trpc";
import type { BuildGetOneResult } from "./Builds";

export type ReviewGetOneResult = RouterOutputs['review']['getOne'];

export type ReviewFromBuildGetOneResult = NonNullable<BuildGetOneResult>["reviews"][number]

export type ReplyFromBuildGetOneResult = ReviewFromBuildGetOneResult["replies"][number]