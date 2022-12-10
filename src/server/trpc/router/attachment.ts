import type { AttachmentsByCategory } from './../../../types/Attachments';
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { AttachmentCategory } from "@prisma/client";
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
	getAllByCategory: publicProcedure.query(async ({ ctx }) => {
		try {
			const attachments = await ctx.prisma.attachment.findMany()
			const attachmentsByCategory = attachments.reduce((acc: AttachmentsByCategory, cur) => {
				if (acc[cur.category]) {
					acc[cur.category].push(cur)
				}
				else {
					acc[cur.category] = [cur]
				}
				return acc
			}, {
				[AttachmentCategory.AMMUNITION]: [],
				[AttachmentCategory.BARREL]: [],
				[AttachmentCategory.BOLT]: [],
				[AttachmentCategory.COMB]: [],
				[AttachmentCategory.GUARD]: [],
				[AttachmentCategory.LASER]: [],
				[AttachmentCategory.MAGAZINE]: [],
				[AttachmentCategory.MUZZLE]: [],
				[AttachmentCategory.OPTIC]: [],
				[AttachmentCategory.REARGRIP]: [],
				[AttachmentCategory.STOCK]: [],
				[AttachmentCategory.TRIGGER]: [],
				[AttachmentCategory.UNDERBARREL]: [],
			})

			return attachmentsByCategory
		}
		catch (error) {
			console.warn('Error in attachment.getAllByCategory: ');
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