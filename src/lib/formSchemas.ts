import { z } from "zod";

export const settingsFormSchema = z.object({
	username: z.string().min(4, {
		message: "Username must be at least 4 characters."
	}).max(25, {
		message: "Username must be less than 25 characters."
	}).regex(/^[a-zA-Z0-9_]+$/, {
		message: "Username can only contain letters, numbers and underscores."
	}).trim(),
	displayName: z.string().min(4, {
		message: "Display name must be at least 4 characters."
	}).max(25, {
		message: "Display name must be less than 25 characters."
	}).regex(/^[a-zA-Z0-9_ -]+$/, {
		message: "Display name can only contain letters, numbers, underscores, dashes, and spaces."
	}).trim(),
	image: z.string().trim().optional(),
	socials: z.object({
		twitch: z.string().trim(),
		discord: z.string().trim(),
		instagram: z.string().trim(),
		tiktok: z.string().trim(),
		youtube: z.string().trim(),
		twitter: z.string().trim(),
	})
})

export const buildFormSchema = z.object({
	title: z
		.string({
			required_error: "Title is required.",
		})
		.min(5, {
			message: "Title must be at least 5 characters.",
		})
		.max(50, {
			message: "Title must be less than 50 characters.",
		}),
	description: z.string().min(50, {
		message: "Description must be at least 50 characters.",
	}),
	weaponId: z.number({
		required_error: "You must select a weapon.",
	}),
	attachmentSetups: z
		.array(
			z.object({
				attachmentId: z.number({
					required_error: "You must select an attachment.",
				}),
				horizontal: z.string(),
				vertical: z.string(),
			})
		)
		.min(1, {
			message: "You must select at least one attachment.",
		})
		.max(5, {
			message: "You can only select up to 5 attachments.",
		}),
});

export const replyFormSchema = z.object({
	content: z
		.string()
		.min(3, {
			message: "Reply must be more than 3 characters.",
		})
		.max(100, { message: "Reply must be less than 100 characters." }),
});