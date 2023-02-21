import { FaChevronCircleDown } from "react-icons/fa";
import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import PopperButton from "../../ui/PopperButton";
import { useState } from "react";
import type { UserGetProfileDataResult } from "../../../types/Users";

const UserModMenu = ({
  user,
}: {
  user: NonNullable<UserGetProfileDataResult>;
}) => {
  const [reason, setReason] = useState<string>("");

  const utils = trpc.useContext();

  const { mutate: banUser } = trpc.mod.banUser.useMutation({
    onSuccess: () => {
      alert("User banned successfully.");
      utils.user.getProfileData.invalidate({
        name: user.name,
      });
      setReason("");
    },
    onError: (error) => {
      alert(error.message);
      console.log(error);
    },
  });

  const { mutate: unbanUser } = trpc.mod.unbanUser.useMutation({
    onSuccess: () => {
      alert("User unbanned successfully.");
      utils.user.getProfileData.invalidate({
        name: user.name,
      });
      setReason("");
    },
    onError: (error) => {
      alert(error.message);
      console.log(error);
    },
  });

  const handleBanUser = async () => {
    if (reason.length < 10) {
      alert("Please enter a reason longer than 10 characters.");
      return;
    }

    banUser({
      userId: user.id,
      reason: reason,
    });
  };

  const handleUnbanUser = async () => {
    if (reason.length < 10) {
      alert("Please enter a reason longer than 10 characters.");
      return;
    }

    unbanUser({
      userId: user.id,
      reason: reason,
    });
  };

  const isUserBanned = user.ban;

  return (
    <PopperButton
      showOn="click"
      tooltip={
        !isUserBanned ? (
          <>
            <label>Please enter a reason why you are banning this user.</label>
            <input
              type="text"
              className="mb-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex w-full justify-end">
              <Button
                text="Ban User"
                variant="plain"
                classNames="bg-red-600 text-white py-2 px-4 hover:bg-red-500"
                onClick={handleBanUser}
              />
            </div>
          </>
        ) : (
          <>
            <label>
              Please enter a reason why you are unbanning this user.
            </label>
            <input
              type="text"
              className="mb-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex w-full justify-end">
              <Button
                text="Unban User"
                variant="plain"
                classNames="bg-emerald-600 text-white py-2 px-4 hover:bg-emerald-500"
                onClick={handleUnbanUser}
              />
            </div>
          </>
        )
      }
      button={<FaChevronCircleDown />}
    />
  );
};

export default UserModMenu;
