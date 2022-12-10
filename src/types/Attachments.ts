import type { Attachment, AttachmentCategory } from "@prisma/client";

export type AttachmentsByCategory = Record<AttachmentCategory, Attachment[]>;