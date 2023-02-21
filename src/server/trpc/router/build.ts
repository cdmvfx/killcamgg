import type { Build, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DateRange, Sort } from "../../../types/Filters";
import hot from "../../../utils/ranking";
import { router, publicProcedure, protectedProcedure, modOrAdminProcedure } from "../trpc";

export const buildRouter = router({
	getAll: publicProcedure
		.input(z.object({
			limit: z.number(),
			sort: z.string(),
			dateRange: z.string(),
			cursor: z.string().nullish(),
			weaponId: z.number().nullable(),
			attachmentIds: z.array(z.number()).nullable(),
		}))
		.query(async ({ input, ctx }) => {

			const limit = input.limit;

			const filters = {
				take: limit + 1,
				cursor: input.cursor ? { id: input.cursor } : undefined,
				where: {
					status: "APPROVED"
				} as Prisma.BuildWhereInput,
				orderBy: {} as Prisma.BuildOrderByWithRelationInput,
				include: {
					weapon: {
						select: {
							name: true
						}
					},
					attachmentSetups: {
						_count: true
					},
					author: {
						select: {
							displayName: true,
						}
					}
				}
			};

			if (input.weaponId) {
				filters.where.weaponId = input.weaponId;
			}

			if (input.attachmentIds && input.attachmentIds.length > 0) {
				filters.where.attachmentSetups = {
					some: {
						attachmentId: {
							in: input.attachmentIds
						}
					}
				}
			}

			switch (input.dateRange) {
				case DateRange.ThisWeek:
					filters.where.updatedAt = {
						gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
						lte: new Date()
					}
					break;
				case DateRange.ThisMonth:
					filters.where.updatedAt = {
						gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
						lte: new Date()
					}
					break;
				case DateRange.ThisYear:
					filters.where.updatedAt = {
						gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
						lte: new Date()
					}
					break;
			}

			switch (input.sort) {
				case Sort.Hot:
					break;
				case Sort.New:
					filters.orderBy = {
						createdAt: "desc"
					}
					break;
				case Sort.Top:
					filters.orderBy = {
						totalLikes: "desc"
					}
					break;
				case Sort.Worst:
					filters.orderBy = {
						totalDislikes: "desc"
					}
					break;
			}

			try {
				let items = await ctx.prisma.build.findMany({
					take: limit + 1,
					cursor: input.cursor ? { id: input.cursor } : undefined,
					where: {
						status: "APPROVED"
					} as Prisma.BuildWhereInput,
					orderBy: {} as Prisma.BuildOrderByWithRelationInput,
					include: {
						weapon: {
							select: {
								name: true
							}
						},
						_count: {
							select: {
								attachmentSetups: true
							}
						},
						author: {
							select: {
								displayName: true,
							}
						}
					}
				});

				if (input.sort === Sort.Hot) {

					items = items.map((item) => {

						const score = hot(item.totalLikes, item.totalDislikes, item.createdAt);

						return {
							item,
							score
						}

					}).sort((a, b) => b.score - a.score).map((item) => item.item);

				}

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
				console.warn('Error in getAll: ');
				console.log(error);
			}
		}),
	getAllPending: modOrAdminProcedure
		.query(async ({ ctx }) => {
			try {
				return await ctx.prisma.build.findMany({
					where: {
						status: "PENDING"
					},
					include: {
						weapon: true,
						_count: {
							select: {
								attachmentSetups: true
							}
						},
						author: {
							select: {
								id: true,
								name: true,
								displayName: true,
								image: true,
							},
						},
					}
				})
			}
			catch (error) {
				console.warn('Error in build.getAllPendingApproval: ');
			}
		}),
	getAllRejected: modOrAdminProcedure
		.query(async ({ ctx }) => {
			try {
				return await ctx.prisma.build.findMany({
					where: {
						status: "REJECTED"
					},
					include: {
						weapon: true,
						_count: {
							select: {
								attachmentSetups: true
							}
						},
						author: {
							select: {
								id: true,
								name: true,
								displayName: true,
								image: true,
							},
						},
					}
				})
			}
			catch (error) {
				console.warn('Error in build.getAllPendingApproval: ');
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
						attachmentSetups: {
							include: {
								attachment: true
							}
						},
						author: {
							select: {
								id: true,
								name: true,
								displayName: true,
								image: true,
							},
						},
						favorites: {
							select: {
								id: true,
							}
						},
						reviews: {
							include: {
								likes: {
									select: {
										id: true
									}
								},
								replies: {
									select: {
										id: true,
										content: true,
										author: {
											select: {
												id: true,
												name: true,
												displayName: true,
												image: true,
											},
										},
										reply: {
											select: {
												author: {
													select: {
														displayName: true,
														name: true
													}
												}
											}
										},
										deletedAt: true,
										createdAt: true,
										updatedAt: true,
										likes: {
											select: {
												id: true
											}
										},
									}
								},
								author: {
									select: {
										id: true,
										name: true,
										displayName: true,
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
				title: z.string(),
				description: z.string(),
				weaponId: z.number(),
				attachmentSetups: z.array(z.object({
					attachmentId: z.number(),
					horizontal: z.string(),
					vertical: z.string()
				})),
			})
		)
		.mutation(async ({ ctx, input }) => {

			try {
				const banned = await ctx.prisma.bannedUser.findUnique({
					where: {
						userId: ctx.session.user.id
					}
				});

				if (banned) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'You are banned from posting builds.'
					})
				}

			}
			catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Error posting build.',
					cause: error
				})
			}

			try {
				await ctx.prisma.build.create({
					data: {
						authorId: ctx.session.user.id,
						title: input.title,
						description: input.description,
						weaponId: input.weaponId,
						attachmentSetups: {
							create: input.attachmentSetups
						}
					}
				})
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Error posting build.',
					cause: error
				})
			}
		}),
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
				description: z.string(),
				weaponId: z.number(),
				attachmentSetups: z.array(z.object({
					attachmentId: z.number(),
					horizontal: z.string(),
					vertical: z.string()
				})),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.attachmentSetup.deleteMany({
					where: {
						buildId: input.id
					}
				})

				await ctx.prisma.build.update({
					where: { id: input.id },
					data: {
						title: input.title,
						description: input.description,
						weaponId: input.weaponId,
						attachmentSetups: {
							create: input.attachmentSetups
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
				await ctx.prisma.attachmentSetup.deleteMany({
					where: {
						buildId: input.id
					}
				})

				await ctx.prisma.build.delete({
					where: { id: input.id }
				})
			} catch (error) {
				console.log(error);
			}
		}),
	toggleFavorite: protectedProcedure
		.input(
			z.object({
				buildId: z.string(),
				status: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {

				if (!input.status) {
					return ctx.prisma.build.update({
						where: {
							id: input.buildId
						},
						data: {
							favorites: {
								disconnect: [{ id: ctx.session.user.id }]
							}
						},
					})
				}

				return ctx.prisma.build.update({
					where: {
						id: input.buildId
					},
					data: {
						favorites: {
							connect: [{ id: ctx.session.user.id }]
						}
					},
				})
			}
			catch (error) {
				console.warn('Error in build.removeFavorite: ');
				console.log(error);
			}
		}),
	getUserPendingBuilds: protectedProcedure
		.query(async ({ ctx }) => {
			return ctx.prisma.build.findMany({
				where: {
					authorId: ctx.session.user.id,
					status: "PENDING"
				}
			})
		})
});