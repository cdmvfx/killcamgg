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