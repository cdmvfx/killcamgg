import { z } from "zod";
import { router, publicProcedure, protectedProcedure, modOrAdminProcedure } from "../trpc";

export const buildRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		try {
			return await ctx.prisma.build.findMany({
				where: {
					status: "APPROVED"
				},
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
	getAllPending: modOrAdminProcedure
		.query(async ({ ctx }) => {
			try {
				return await ctx.prisma.build.findMany({
					where: {
						status: "PENDING"
					},
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
						attachmentSetups: {
							include: {
								attachment: true
							}
						},
						author: {
							select: {
								id: true,
								name: true,
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
												image: true,
											},
										},
										reply: {
											select: {
												author: {
													select: {
														name: true
													}
												}
											}
										},
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
	approve: modOrAdminProcedure
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
	reject: modOrAdminProcedure
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
		})

});