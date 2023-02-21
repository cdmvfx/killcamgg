import type { Role } from "@prisma/client";

export const RoleBadge = ({ role }: { role: Role }) => {
  switch (role) {
    case "ADMIN":
      return <span className="rounded-full bg-orange-600 px-2">Admin</span>;
    case "MODERATOR":
      return <span className="rounded-full bg-orange-600 px-2">Moderator</span>;
    case "CREATOR":
      return <span className="rounded-full bg-orange-600 px-2">Creator</span>;
    default:
      <></>;
  }
  return <></>;
};
