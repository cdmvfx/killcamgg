import { publicProcedure } from './../trpc';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { TRPCError } from '@trpc/server';
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const reviewRouter = router({
	getOne: publicProcedure
		.input(
			z.object({
				buildId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				if (!ctx.session?.user?.id) {
					return null;
				}
				return await ctx.prisma.review.findUnique({
					where: {
						authorId_buildId: {
							authorId: ctx.session?.user?.id,
							buildId: input.buildId
						}
					},
					include: {
						_count: {
							select: {
								likes: true
							}
						}
					}
				})
			}
			catch (error) {
				console.log('Error in review.getOne: ', error);
			}
		}),
	post: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
				isLike: z.boolean().nullable(),
				content: z.string().nullable(),
			})
		)
		.mutation(async ({ ctx, input }) => {

			try {
				await ctx.prisma.review.create({
					data: {
						buildId: input.buildId,
						authorId: ctx.session.user.id,
						isLike: input.isLike,
						content: input.content,
						deletedAt: null
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

			// Calculate new average rating
			const reviews = await ctx.prisma.review.findMany({
				where: {
					buildId: input.buildId,
					deletedAt: null
				},
				select: {
					isLike: true
				}
			})

			let totalLikes = 0;
			let totalDislikes = 0;
			let totalRatings = 0;
			let totalReviews = 0;

			for (const review of reviews) {
				if (review.isLike === true) totalLikes++;
				if (review.isLike === false) totalDislikes++;
				if (review.isLike !== null) totalRatings++;
				totalReviews++;
			}

			const averageRating = ((totalLikes / totalRatings) * 10) / 2 || 0;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
						totalLikes,
						totalDislikes,
						totalRatings,
						totalReviews
					}
				})
			}
			catch (error) {
				console.log('Error calculating new average rating in review.postReview: ', error);
			}
		}),
	edit: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
				isLike: z.boolean().nullable(),
				content: z.string().nullable()
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
						isLike: input.isLike,
						content: input.content,
						deletedAt: null
					}
				})
			}
			catch (error) {
				console.log('Error in review.editReview: ', error);
			}

			// Calculate new average rating
			const reviews = await ctx.prisma.review.findMany({
				where: {
					buildId: input.buildId,
					deletedAt: null
				},
				select: {
					isLike: true
				}
			})

			let totalLikes = 0;
			let totalDislikes = 0;
			let totalRatings = 0;
			let totalReviews = 0;

			for (const review of reviews) {
				if (review.isLike === true) totalLikes++;
				if (review.isLike === false) totalDislikes++;
				if (review.isLike !== null) totalRatings++;
				totalReviews++;
			}

			const averageRating = ((totalLikes / totalRatings) * 10) / 2 || 0;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
						totalLikes,
						totalDislikes,
						totalRatings,
						totalReviews
					}
				})
			}
			catch (error) {
				console.log('Error calculating new average rating in review.editReview: ', error);
			}
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				buildId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.review.update({
					where: {
						id: input.id
					},
					data: {
						deletedAt: new Date()
					}
				})
			}
			catch (error) {
				console.log('Error in review.deleteReview: ', error);
			}

			// Calculate new average rating
			const reviews = await ctx.prisma.review.findMany({
				where: {
					buildId: input.buildId,
					deletedAt: null
				},
				select: {
					isLike: true
				}
			})

			let totalLikes = 0;
			let totalDislikes = 0;
			let totalRatings = 0;
			let totalReviews = 0;

			for (const review of reviews) {
				if (review.isLike === true) totalLikes++;
				if (review.isLike === false) totalDislikes++;
				if (review.isLike !== null) totalRatings++;
				totalReviews++;
			}

			const averageRating = ((totalLikes / totalRatings) * 10) / 2 || 0;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
						totalLikes,
						totalDislikes,
						totalRatings,
						totalReviews
					}
				})
			}
			catch (error) {
				console.log('Error calculating new average rating in review.deleteReview: ', error);
			}
		}),
	like: protectedProcedure
		.input(
			z.object({
				reviewId: z.string(),
				status: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				if (input.status) {
					await ctx.prisma.review.update({
						where: { id: input.reviewId },
						data: {
							likes: {
								connect: [{ id: ctx.session.user.id }]
							}
						}
					})
				}
				else {
					await ctx.prisma.review.update({
						where: { id: input.reviewId },
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
	changeLike: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
				isLike: z.boolean().nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const review = await ctx.prisma.review.upsert({
					where: {
						authorId_buildId: {
							authorId: ctx.session.user.id,
							buildId: input.buildId
						}
					},
					update: {
						isLike: input.isLike
					},
					create: {
						authorId: ctx.session.user.id,
						buildId: input.buildId,
						isLike: input.isLike
					}
				})

				if (!review) throw (`Review not found`)
			}
			catch (error) {
				console.warn('Error in build.changeLike: ');
				console.log(error);
			}

			// Calculate new average rating
			const reviews = await ctx.prisma.review.findMany({
				where: {
					buildId: input.buildId,
					deletedAt: null
				},
				select: {
					isLike: true
				}
			})

			let totalLikes = 0;
			let totalDislikes = 0;
			let totalRatings = 0;
			let totalReviews = 0;

			for (const review of reviews) {
				if (review.isLike === true) totalLikes++;
				if (review.isLike === false) totalDislikes++;
				if (review.isLike !== null) totalRatings++;
				totalReviews++;
			}

			const averageRating = ((totalLikes / totalRatings) * 10) / 2 || 0;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
						totalLikes,
						totalDislikes,
						totalRatings,
						totalReviews
					}
				})
			}
			catch (error) {
				console.log('Error calculating new average rating in review.changeLike: ', error);
			}
		})
})