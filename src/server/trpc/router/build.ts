import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const buildRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		try {
			return await ctx.prisma.build.findMany({
				include: {
					weapon: true,
					attachments: true,
					author: true
				}
			});
		}
		catch (error) {
			console.warn('Error in getAll: ');
			console.log(error);
		}
	}),
	postBuild: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				title: z.string(),
				description: z.string(),
				weaponId: z.number(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.build.create({
					data: {
						authorId: input.userId,
						title: input.title,
						description: input.description,
						weaponId: input.weaponId
					}
				})
			} catch (error) {
				console.log(error);
			}
		}),
});