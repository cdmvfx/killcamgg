import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider, { type DiscordProfile } from "next-auth/providers/discord";
import TwitchProvider, { type TwitchProfile } from "next-auth/providers/twitch";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		session: ({ session, user }) => {

			if (session.user) {
				session.user.id = user.id;
				session.user.role = user.role;
			}

			return session;
		},
	},
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	pages: {
		signIn: '/auth/signin',
		newUser: '/auth/profile-setup'
	},
	providers: [
		DiscordProvider<DiscordProfile>({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			profile(profile) {
				return {
					id: profile.id,
					name: profile.username,
					displayName: profile.username,
					email: profile.email,
					image: profile.image_url,
					role: "USER"
				}
			}
		}),
		TwitchProvider<TwitchProfile>({
			clientId: env.TWITCH_CLIENT_ID,
			clientSecret: env.TWITCH_CLIENT_SECRET,
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.preferred_username,
					displayName: profile.preferred_username,
					email: profile.email,
					image: profile.picture,
					role: "USER"
				}
			}
		}),
		// ...add more providers here
	]
};

export default NextAuth(authOptions);
