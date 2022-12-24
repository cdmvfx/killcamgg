import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const reviewRouter = router({
	postReview: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
				rating: z.number(),
				content: z.string(),
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
				console.log('Error in build.postReview: ', error);
			}
		}),
	editReview: protectedProcedure
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
						id
					},
					data: {
						rating: input.rating,
						content: input.content
					}
				})
			}
			catch (error) {
				console.log('Error in build.editReview: ', error);
			}
		})
})