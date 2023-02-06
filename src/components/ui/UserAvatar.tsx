import type { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type UserAvatarProps = {
  user: Pick<User, "id" | "name" | "image">;
  date?: Date;
  showAvatar?: boolean;
  showName?: boolean;
  className?: string;
};

const UserAvatar = ({
  user,
  showAvatar = false,
  showName = true,
  date,
  className,
}: UserAvatarProps) => {
  return (
    <Link
      href={`/${user.name}`}
      className={`flex items-center transition-all hover:text-orange-500 ${className}`}
    >
      {showAvatar && (
        <Image
          src={user.image as string}
          alt={`${user.name} profile picture`}
          width={30}
          height={30}
          className="mr-4 rounded-full"
        />
      )}
      {showName && (
        <div className="">
          <div>
            <div>{user.name}</div>
            {date && <div className="text-xs">{date.toLocaleDateString()}</div>}
          </div>
        </div>
      )}
    </Link>
  );
};

export default UserAvatar;
