import type { Attachment, AttachmentCategory, AttachmentSetup } from "@prisma/client";

export type AttachmentsByCategory = Record<AttachmentCategory, Attachment[]>;

export type AttachmentTuning = {
	horizontal: string;
	vertical: string;
}

export type AttachmentSetupWithAttachment = Omit<AttachmentSetup, "id" | "buildId" | "attachmentId"> & {
	attachment: Attachment | null;
}