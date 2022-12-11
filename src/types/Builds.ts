import type { Attachment, Build, User, Weapon } from "@prisma/client";

export type CompleteBuildData = Build & {
	createdAt: string;
	updatedAt: string;
	author: User;
	weapon: Weapon;
	attachments: Attachment[]
}