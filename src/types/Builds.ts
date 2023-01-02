import type { Attachment, AttachmentSetup, Build, Review, Weapon } from "@prisma/client";
import type { RouterOutputs } from "../utils/trpc";


export type BuildGetAllResult = RouterOutputs['build']['getAll'];

export type BuildGetOneResult = RouterOutputs['build']['getOne'];

export type BuildWithReviewsAndAuthor = Build & {
	weapon: Weapon;
	reviews?: (Review & {
		author: {
			id: string;
			name: string | null;
			image: string | null;
		};
	})[];
	author: {
		id: string;
		name: string | null;
		image: string | null;
	};
	attachmentSetups: (AttachmentSetup & {
		attachment: Attachment;
	})[];
};