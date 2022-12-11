import type { Build, Review, User } from "@prisma/client";

export type CompleteReviewData = Review & {
	build?: Build
	createdAt: string;
	author: User;
}