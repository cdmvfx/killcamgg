import type { User } from "@prisma/client";

export const isAuthorized = (user: User & any) => {
	if (!user) {
		return false;
	}

	if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
		return false;
	}

	return true;
}