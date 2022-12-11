import { z } from "zod";
import { router, publicProcedure } from "../trpc";

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
})