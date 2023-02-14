import { Build, Review } from "@prisma/client";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = router({
	getProfileData: publicProcedure
		.input(
			z.object({
				name: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				return await ctx.prisma.user.findFirst({
					where: { name: { equals: input.name, mode: "insensitive" } },
					select: {
						name: true,
						displayName: true,
						image: true,
						role: true,
						score: true,
						isVerified: true,
						createdAt: true,
						id: true,
						socials: {
							select: {
								discord: true,
								twitter: true,
								youtube: true,
								twitch: true,
								instagram: true,
								tiktok: true
							}
						},
						builds: {
							take: 3,
							include: {
								author: {
									select: {
										id: true,
										name: true,
										displayName: true,
										image: true,
									},
								},
								weapon: true,
								attachmentSetups: {
									include: {
										attachment: true,
									}
								},
							},
						},
						reviews: {
							take: 3,
							include: {
								build: true,
							},
						},
						favorites: {
							take: 3,
							include: {
								author: {
									select: {
										id: true,
										name: true,
										displayName: true,
										image: true,
									},
								},
								weapon: true,
								attachmentSetups: {
									include: {
										attachment: true,
									}
								},
							},
						},
					},
				});
			}
			catch (error) {
				console.warn('Error in user.getProfileData: ');
				console.log(error);
			}
		}),
	getOne: publicProcedure
		.input(
			z.object({
				id: z.string().nullable()
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				if (!input.id) return null;

				return await ctx.prisma.user.findFirst({
					where: {
						id: input.id,
					},
					include: {
						favorites: {
							select: {
								id: true
							}
						},
						likedReplies: {
							select: {
								id: true
							}
						},
						likedReviews: {
							select: {
								id: true
							}
						},
					},
				});
			}
			catch (error) {
				console.warn('Error in build.getOne: ');
				console.log(error);
			}
		}),

	getSelf: publicProcedure
		.query(async ({ ctx }) => {
			try {
				if (!ctx.session) return null;

				return await ctx.prisma.user.findFirst({
					where: {
						id: ctx.session.user?.id,
					},
					include: {
						favorites: {
							select: {
								id: true
							}
						},
						likedReplies: {
							select: {
								id: true
							}
						},
						likedReviews: {
							select: {
								id: true
							}
						},
					},
				});
			}
			catch (error) {
				console.warn('Error in user.getSelf: ');
				console.log(error);
			}
		}),

	getBuilds: publicProcedure
		.input(
			z.object({
				name: z.string(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {

				const limit = 3;

				const items = await ctx.prisma.build.findMany({
					where: {
						author: {
							name: input.name
						}
					},
					take: limit + 1,
					cursor: input.cursor ? { id: input.cursor } : undefined,
					include: {
						author: {
							select: {
								id: true,
								name: true,
								displayName: true,
								image: true,
							},
						},
						weapon: true,
						attachmentSetups: {
							include: {
								attachment: true,
							}
						},
					},
				});

				let nextCursor: typeof input.cursor | undefined = undefined;
				if (items.length > limit) {
					const nextItem = items.pop() as Build
					nextCursor = nextItem.id;
				}

				return {
					items,
					nextCursor
				}
			}
			catch (error) {
				console.warn('Error in user.getBuilds: ');
				console.log(error);
			}
		}),

	getFavorites: publicProcedure
		.input(
			z.object({
				name: z.string(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				const limit = 3;

				const items = await ctx.prisma.build.findMany({
					where: {
						favorites: {
							some: {
								name: input.name
							}
						}
					},
					take: limit + 1,
					cursor: input.cursor ? { id: input.cursor } : undefined,
					include: {
						author: {
							select: {
								id: true,
								name: true,
								displayName: true,
								image: true,
							},
						},
						weapon: true,
						attachmentSetups: {
							include: {
								attachment: true,
							}
						},
					},
				});

				let nextCursor: typeof input.cursor | undefined = undefined;
				if (items.length > 9) {
					const nextItem = items.pop() as Build
					nextCursor = nextItem.id;
				}

				return {
					items,
					nextCursor
				}
			}
			catch (error) {
				console.warn('Error in user.getFavorites: ');
				console.log(error);
			}
		}),

	getReviews: publicProcedure
		.input(
			z.object({
				name: z.string(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				const limit = 3;

				const items = await ctx.prisma.review.findMany({
					where: {
						author: {
							name: input.name
						}
					},
					take: limit + 1,
					cursor: input.cursor ? { id: input.cursor } : undefined,
					include: {
						build: true,
					},
				});

				let nextCursor: typeof input.cursor | undefined = undefined;
				if (items.length > 9) {
					const nextItem = items.pop() as Review
					nextCursor = nextItem.id;
				}

				return {
					items,
					nextCursor
				}
			}
			catch (error) {
				console.warn('Error in user.getFavorites: ');
				console.log(error);
			}
		}),
})