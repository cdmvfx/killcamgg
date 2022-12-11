import type { User } from "@prisma/client";
import Image from "next/image";
import React from "react";

type UserAvatarProps = {
  user: User;
  showAvatar?: boolean;
};

const UserAvatar = ({ user, showAvatar = false }: UserAvatarProps) => {
  return (
    <div className="inline-block">
      <div className="flex items-center border border-neutral-500">
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
      </div>
    </div>
  );
};

export default UserAvatar;
