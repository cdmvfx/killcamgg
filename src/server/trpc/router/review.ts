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
				isLike: z.boolean(),
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

			// Calculate new average rating
			const build = await ctx.prisma.build.findUnique({
				where: { id: input.buildId },
				include: {
					reviews: {
						select: {
							isLike: true
						}
					}
				}
			});

			if (!build) return;

			const totalLikes = build.reviews.reduce((acc, review) => {
				if (review.isLike) return acc + 1;
				return acc;
			}, 0)

			const averageRating = ((totalLikes / build.reviews.length) * 10) / 2 || 0;
			const totalReviews = build.reviews.length;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
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
				isLike: z.boolean(),
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
						isLike: input.isLike,
						content: input.content
					}
				})
			}
			catch (error) {
				console.log('Error in review.editReview: ', error);
			}

			// Calculate new average rating
			const build = await ctx.prisma.build.findUnique({
				where: { id: input.buildId },
				include: {
					reviews: {
						select: {
							isLike: true
						}
					}
				}
			});

			if (!build) return;

			const totalLikes = build.reviews.reduce((acc, review) => {
				if (review.isLike) return acc + 1;
				return acc;
			}, 0)

			const averageRating = ((totalLikes / build.reviews.length) * 10) / 2 || 0;
			const totalReviews = build.reviews.length;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
						totalReviews
					}
				})
			}
			catch (error) {
				console.log('Error calculating new average rating in review.postReview: ', error);
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
				await ctx.prisma.review.delete({
					where: {
						id: input.id
					}
				})
			}
			catch (error) {
				console.log('Error in review.deleteReview: ', error);
			}

			// Calculate new average rating
			const build = await ctx.prisma.build.findUnique({
				where: { id: input.buildId },
				include: {
					reviews: {
						select: {
							isLike: true
						}
					}
				}
			});

			if (!build) return;

			const totalLikes = build.reviews.reduce((acc, review) => {
				if (review.isLike) return acc + 1;
				return acc;
			}, 0)

			const averageRating = ((totalLikes / build.reviews.length) * 10) / 2 || 0;
			const totalReviews = build.reviews.length;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
						totalReviews
					}
				})
			}
			catch (error) {
				console.log('Error calculating new average rating in review.postReview: ', error);
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
			const build = await ctx.prisma.build.findUnique({
				where: { id: input.buildId },
				include: {
					reviews: {
						select: {
							isLike: true
						}
					}
				}
			});

			if (!build) return;

			const totalLikes = build.reviews.reduce((acc, review) => {
				if (review.isLike) return acc + 1;
				return acc;
			}, 0)

			const averageRating = ((totalLikes / build.reviews.length) * 10) / 2 || 0;
			const totalReviews = build.reviews.length;

			try {
				await ctx.prisma.build.update({
					where: { id: input.buildId },
					data: {
						averageRating,
						totalReviews
					}
				})
			}
			catch (error) {
				console.log('Error calculating new average rating in review.postReview: ', error);
			}
		})
})