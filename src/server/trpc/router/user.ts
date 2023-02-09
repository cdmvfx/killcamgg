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
										id: true,
										name: true,
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
							include: {
								build: true,
							},
						},
						favorites: {
							include: {
								author: {
									select: {
										id: true,
										name: true,
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
		})
})