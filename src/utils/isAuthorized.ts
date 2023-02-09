import type { Session } from "next-auth";

export const isAuthorized = (user: NonNullable<Session['user']> | null) => {
	if (!user) {
		return false;
	}

	if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
		return false;
	}

	return true;
}