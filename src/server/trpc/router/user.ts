import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = router({
	getOne: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				return await ctx.prisma.user.findUnique({
					where: {
						id: input.id
					},
					select: {
						id: true,
						name: true,
						builds: true,
						reviews: true,
						favorites: true
					}
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