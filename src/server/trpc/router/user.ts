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
						image: true,
						createdAt: true,
						id: true,
						builds: {
							include: {
								author: {
									select: {
										name: true,
										image: true,
									},
								},
								weapon: true,
								attachments: true,
							},
						},
						reviews: {
							include: {
								build: true,
							},
						},
						favorites: {
							include: {
								author: {
									select: {
										name: true,
										image: true,
									},
								},
								weapon: true,
								attachments: true,
							},
						},
					},
				});
			}
			catch (error) {
				console.warn('Error in build.getProfileData: ');
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
						favorites: true,
					},
				});
			}
			catch (error) {
				console.warn('Error in build.getOne: ');
				console.log(error);
			}
		}),
	toggleFavorite: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const user = await ctx.prisma.user.findUnique({
					where: {
						id: ctx.session.user.id
					},
					select: {
						favorites: true
					}
				})

				if (!user) throw (`User ${ctx.session.user.id} not found`)

				const isFavorite = user.favorites.some(favorite => favorite.id === input.buildId)

				console.log(isFavorite, user.favorites, input.buildId)

				if (isFavorite) {
					return await ctx.prisma.user.update({
						where: {
							id: ctx.session.user.id
						},
						data: {
							favorites: {
								disconnect: [{ id: input.buildId }]
							}
						},
						select: {
							favorites: true
						}
					});
				}

				return await ctx.prisma.user.update({
					where: {
						id: ctx.session.user.id
					},
					data: {
						favorites: {
							connect: [{ id: input.buildId }]
						}
					},
					select: {
						favorites: true
					}
				});


			}
			catch (error) {
				console.warn('Error in build.removeFavorite: ');
				console.log(error);
			}
		})
})