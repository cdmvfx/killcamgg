import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { TRPCError } from '@trpc/server';
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const reviewRouter = router({
	post: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
				rating: z.number(),
				content: z.string().nullable(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.review.create({
					data: {
						buildId: input.buildId,
						authorId: ctx.session.user.id,
						rating: input.rating,
						content: input.content
					}
				})
			}
			catch (error) {
				console.log('Error in review.postReview: ', error);
				if (error instanceof PrismaClientKnownRequestError) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "You have already submitted a review for this build. Please edit your existing review instead."
					})
				}
			}
		}),
	edit: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
				rating: z.number(),
				content: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.review.update({
					where: {
						authorId_buildId: {
							authorId: ctx.session.user.id,
							buildId: input.buildId
						}
					},
					data: {
						rating: input.rating,
						content: input.content
					}
				})
			}
			catch (error) {
				console.log('Error in review.editReview: ', error);
			}
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.review.delete({
					where: {
						id: input.id
					}
				})
			}
			catch (error) {
				console.log('Error in review.deleteReview: ', error);
			}
		})
})