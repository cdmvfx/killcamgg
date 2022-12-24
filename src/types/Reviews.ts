import type { Build, Review, User } from "@prisma/client";
import type { BuildSerialized } from "./Builds";
import type { UserSerialized } from "./Users";

export type CompleteReviewData = Review & {
	createdAt: string;
	build?: Build
	author: User;
}

export type ReviewSerialized = Omit<Review, "createdAt" | "updatedAt"> & {
	createdAt: string;
	updatedAt: string;
}

export type CompleteReviewDataSerialized = ReviewSerialized & {
	build?: BuildSerialized
	author: Pick<UserSerialized, "id" | "name" | "image">;
}