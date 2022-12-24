import Image from "next/image";
import Link from "next/link";
import type { UserSerialized } from "../../types/Users";

type UserAvatarProps = {
  user: Pick<UserSerialized, "id" | "name" | "image">;
  showAvatar?: boolean;
};

const UserAvatar = ({ user, showAvatar = false }: UserAvatarProps) => {
  return (
    <div className="inline-block">
      <Link
        href={`/${user.name}`}
        className="flex items-center border border-neutral-500"
      >
        {showAvatar && (
          <Image
            src={user.image as string}
            alt={`${user.name} profile picture`}
            width={30}
            height={30}
            className=""
          />
        )}
        <div className="px-2">{user.name}</div>
      </Link>
    </div>
  );
};

export default UserAvatar;
