import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const replyRouter = router({
	post: protectedProcedure
		.input(
			z.object({
				reviewId: z.string(),
				replyId: z.string().optional(),
				content: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.reply.create({
					data: {
						authorId: ctx.session.user.id,
						reviewId: input.reviewId,
						replyId: input.replyId,
						content: input.content,
					}
				})
			} catch (error) {
				console.log(error);
			}
		}),
	like: protectedProcedure
		.input(
			z.object({
				replyId: z.string(),
				status: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {

				if (input.status) {
					await ctx.prisma.reply.update({
						where: { id: input.replyId },
						data: {
							likes: {
								connect: [{ id: ctx.session.user.id }]
							}
						}
					})
				}
				else {
					await ctx.prisma.reply.update({
						where: { id: input.replyId },
						data: {
							likes: {
								disconnect: [{ id: ctx.session.user.id }]
							}
						}
					})
				}
			}
			catch (e) {
				console.log(e);
			}
		}),
	delete: protectedProcedure
		.input(
			z.object({
				replyId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session.user) {
				throw new Error("Not logged in");
			}
			try {
				await ctx.prisma.reply.update({
					where: { id: input.replyId },
					data: {
						deletedAt: new Date()
					}
				})
			}
			catch (e) {
				console.log(e);
			}
		})
})