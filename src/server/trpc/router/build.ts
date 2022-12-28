import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const buildRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		try {
			return await ctx.prisma.build.findMany({
				include: {
					weapon: true,
					attachments: true,
					author: {
						select: {
							id: true,
							name: true,
							image: true
						}
					}
				}
			});
		}
		catch (error) {
			console.warn('Error in getAll: ');
			console.log(error);
		}
	}),
	getOne: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				return await ctx.prisma.build.findUnique({
					where: { id: input.id },
					include: {
						weapon: true,
						attachments: true,
						author: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
						reviews: {
							include: {
								author: {
									select: {
										id: true,
										name: true,
										image: true,
									},
								},
							},
						},
					},
				});
			}
			catch (error) {
				console.warn('Error in build.getOne: ');
				console.log(error);
			}
		}),
	post: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				title: z.string(),
				description: z.string(),
				weaponId: z.number(),
				attachmentIds: z.array(z.number()),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.build.create({
					data: {
						authorId: input.userId,
						title: input.title,
						description: input.description,
						weaponId: input.weaponId,
						attachments: {
							connect: input.attachmentIds.map((id) => ({ id })),
						}
					}
				})
			} catch (error) {
				console.log(error);
			}
		}),
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
				description: z.string(),
				weaponId: z.number(),
				attachmentIds: z.array(z.number()),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.build.update({
					where: { id: input.id },
					data: {
						title: input.title,
						description: input.description,
						weaponId: input.weaponId,
						attachments: {
							set: input.attachmentIds.map((id) => ({ id })),
						}
					}
				})
			} catch (error) {
				console.log(error);
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
				await ctx.prisma.build.delete({
					where: { id: input.id }
				})
			} catch (error) {
				console.log(error);
			}
		})

});