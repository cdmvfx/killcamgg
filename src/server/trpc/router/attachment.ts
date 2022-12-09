import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import type { AttachmentCategory } from "@prisma/client";
import attachments from "../../../lib/attachments";

export const attachmentRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		try {
			return await ctx.prisma.attachment.findMany()
		}
		catch (error) {
			console.warn('Error in attachment.getAll: ');
			console.log(error);
		}
	}),
	setDefault: protectedProcedure
		.mutation(async ({ ctx }) => {
			console.log('adding attachments')

			for (const [category, items] of Object.entries(attachments)) {
				await ctx.prisma.attachment.createMany({
					data: items.map((item) => ({
						name: item.name,
						category: category as AttachmentCategory,
						unlock_req: item.req
					}))
				})
			}
		}),
})