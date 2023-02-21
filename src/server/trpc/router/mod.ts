import { z } from "zod";
import { router, modOrAdminProcedure } from "../trpc";

export const modRouter = router({
	banUser: modOrAdminProcedure
		.input(z.object({
			userId: z.string(),
			reason: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.bannedUser.create({
					data: {
						userId: input.userId,
						reason: input.reason
					}
				});

				await ctx.prisma.activityLog.create({
					data: {
						modId: ctx.session.user.id,
						userId: input.userId,
						type: "BANNED_USER",
						notes: input.reason
					}
				});

				return true;
			} catch (error) {
				console.log(error);
				return error;
			}
		}),

	unbanUser: modOrAdminProcedure
		.input(z.object({
			userId: z.string(),
			reason: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.bannedUser.delete({
					where: {
						userId: input.userId
					}
				});

				await ctx.prisma.activityLog.create({
					data: {
						modId: ctx.session.user.id,
						userId: input.userId,
						notes: input.reason,
						type: "UNBANNED_USER",
					}
				});

				return true;
			} catch (error) {
				console.log(error);
				return error;
			}
		}),

	deleteBuild: modOrAdminProcedure
		.input(z.object({
			buildId: z.string(),
			reason: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.build.delete({
					where: {
						id: input.buildId
					}
				});

				await ctx.prisma.activityLog.create({
					data: {
						modId: ctx.session.user.id,
						buildId: input.buildId,
						type: "DELETED_BUILD",
						notes: input.reason
					}
				});

				return true;
			} catch (error) {
				console.log(error);
				return error;
			}
		}),

	deleteReview: modOrAdminProcedure
		.input(z.object({
			reviewId: z.string(),
			reason: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.review.delete({
					where: {
						id: input.reviewId
					}
				});

				await ctx.prisma.activityLog.create({
					data: {
						modId: ctx.session.user.id,
						reviewId: input.reviewId,
						type: "DELETED_REVIEW",
						notes: input.reason
					}
				});

				return true;
			} catch (error) {
				console.log(error);
				return error;
			}
		}),

	deleteReply: modOrAdminProcedure
		.input(z.object({
			replyId: z.string(),
			reason: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.reply.delete({
					where: {
						id: input.replyId
					}
				});

				await ctx.prisma.activityLog.create({
					data: {
						modId: ctx.session.user.id,
						replyId: input.replyId,
						type: "DELETED_REPLY",
						notes: input.reason
					}
				});

				return true;
			} catch (error) {
				console.log(error);
				return error;
			}
		}),

	approveBuild: modOrAdminProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.build.update({
					where: { id: input.id },
					data: {
						status: "APPROVED"
					}
				})

				await ctx.prisma.activityLog.create({
					data: {
						userId: ctx.session.user.id,
						type: "APPROVED_BUILD",
						buildId: input.id
					}
				})
			} catch (error) {
				console.log('Error approving build.', error);
			}
		}),

	rejectBuild: modOrAdminProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.build.update({
					where: { id: input.id },
					data: {
						status: "REJECTED"
					}
				})

				await ctx.prisma.activityLog.create({
					data: {
						userId: ctx.session.user.id,
						type: "REJECTED_BUILD",
						buildId: input.id
					}
				})
			} catch (error) {
				console.log('Error approving build.', error);
			}
		}),

})
