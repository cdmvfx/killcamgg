import { TRPCError } from "@trpc/server";
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
				const banned = await ctx.prisma.bannedUser.findUnique({
					where: {
						userId: ctx.session.user.id
					}
				});

				if (banned) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'You are banned from posting replies.'
					})
				}

			}
			catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Error posting build.',
					cause: error
				})
			}

			try {
				// Get user's replies from past 10 minutes
				const replies = await ctx.prisma.reply.findMany({
					where: {
						authorId: ctx.session.user.id,
						createdAt: {
							gte: new Date(new Date().getTime() - 10 * 60 * 1000)
						}
					}
				})

				// If user has already posted a reply in the past 10 minutes, throw an error
				if (replies.length > 5) {
					throw new Error("You have posted too many replies in the past 10 minutes. Please wait a few minutes before posting again.")
				}
			}
			catch (error) {
				if (error instanceof Error) {
					throw new TRPCError({
						code: "TOO_MANY_REQUESTS",
						message: error.message,
						cause: error
					})
				}
				return;
			}

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
				await ctx.prisma.reply.delete({
					where: { id: input.replyId }
				})
			}
			catch (e) {
				console.log(e);
			}
		}),

	report: protectedProcedure
		.input(
			z.object({
				replyId: z.string(),
				reason: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return ctx.prisma.report.create({
					data: {
						authorId: ctx.session.user.id,
						replyId: input.replyId,
						notes: input.reason
					}
				})
			}
			catch (error) {
				console.warn('Error in reply.report: ');
				console.log(error);
			}
		})
})