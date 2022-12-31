import type { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type UserAvatarProps = {
  user: Pick<User, "id" | "name" | "image">;
  showAvatar?: boolean;
};

const UserAvatar = ({ user, showAvatar = false }: UserAvatarProps) => {
  return (
    <div className="inline-block hover:text-orange-600">
      <Link href={`/${user.name}`} className="flex items-center">
        {showAvatar && (
          <Image
            src={user.image as string}
            alt={`${user.name} profile picture`}
            width={30}
            height={30}
            className="rounded-full"
          />
        )}
        <div className="px-2">{user.name}</div>
      </Link>
    </div>
  );
};

export default UserAvatar;
