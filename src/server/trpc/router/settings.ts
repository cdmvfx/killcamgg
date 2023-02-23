import { TRPCError } from '@trpc/server';
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { uploadImage } from "../../common/cloudinary";
import { settingsFormSchema } from '../../../lib/formSchemas';

export const settingsRouter = router({
	getSettings: protectedProcedure
		.query(async ({ ctx }) => {

			return await ctx.prisma.user.findFirst({
				where: { id: ctx.session.user.id },
				select: {
					name: true,
					displayName: true,
					image: true,
					socials: true,
					email: true,
				},
			});
		}),

	saveSettings: protectedProcedure
		.input(settingsFormSchema)
		.mutation(async ({ ctx, input }) => {

			const userWithSameName = await ctx.prisma.user.findFirst({
				where: {
					name: {
						equals: input.username,
						mode: 'insensitive',
					},
				}
			})

			if (userWithSameName && userWithSameName.id !== ctx.session.user.id) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'User with that name already exists'
				});
			}

			const reservedUsernames = ['admin', 'administrator', 'moderator', 'mod', 'user', 'settings', 'login', 'logout', 'register', 'forgot-password', 'reset-password', 'api', 'auth', 'dashboard', 'build', 'builds', 'reviews', 'users', 'settings', 'about', 'contact', 'privacy', 'review', 'user', 'username', 'setting', 'terms', '404', '500', 'search', 'auth'];

			if (reservedUsernames.includes(input.username.toLowerCase().trim())) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Invalid username'
				});
			}

			let url = null;

			if (input.image) {
				try {
					url = await uploadImage(input.image);
				}
				catch (err) {
					console.log('Failed to upload image', err);
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Failed to upload profile image.'
					});
				}
			}

			await ctx.prisma.user.update({
				where: { id: ctx.session.user.id },
				data: {
					name: input.username,
					displayName: input.displayName,
					image: url ? url : undefined,
					socials: {
						upsert: {
							create: input.socials,
							update: input.socials
						}
					},
				}
			})



		}),

	uploadPhoto: protectedProcedure
		.input(
			z.object({
				encodedImage: z.string()
			})
		)
		.mutation(async ({ input }) => {

			try {
				return uploadImage(input.encodedImage);
			}
			catch (err) {
				console.log('Failed to upload image', err);
			}

		})
})
