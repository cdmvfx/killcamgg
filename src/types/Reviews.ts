import type { Build, Review } from "@prisma/client";

export type ReviewWithAuthorAndBuild = Review & {
	author?: {
		id: string;
		name: string | null;
		image: string | null;
	};
	build?: Build;
};