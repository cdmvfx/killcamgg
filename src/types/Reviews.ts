import type { Build, Review } from "@prisma/client";
import type { RouterOutputs } from "../utils/trpc";
import type { BuildGetOneResult } from "./Builds";

export type ReviewGetOneResult = RouterOutputs['review']['getOne'];

export type ReviewWithAuthorAndBuild = Review & {
	author?: {
		id: string;
		name: string | null;
		image: string | null;
	};

	build?: Build;
};

export type ReviewFromBuildGetOneResult = NonNullable<BuildGetOneResult>["reviews"][number]

export type ReplyFromBuildGetOneResult = ReviewFromBuildGetOneResult["replies"][number]