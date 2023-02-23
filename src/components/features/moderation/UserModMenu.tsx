import { FaBan } from "react-icons/fa";
import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import { useState } from "react";
import type { UserGetProfileDataResult } from "../../../types/Users";
import ModalButton from "../../ui/ModalButton";
import toast from "react-hot-toast";

const UserModMenu = ({
  user,
}: {
  user: NonNullable<UserGetProfileDataResult>;
}) => {
  const [showModal, setShowModal] = useState(false);

  const [reason, setReason] = useState<string>("");

  const utils = trpc.useContext();

  const { mutate: banUser } = trpc.mod.banUser.useMutation({
    onSuccess: () => {
      toast.success("User banned successfully.");
      utils.user.getProfileData.invalidate({
        name: user.name,
      });
      setReason("");
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const { mutate: unbanUser } = trpc.mod.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("User unbanned successfully.");
      utils.user.getProfileData.invalidate({
        name: user.name,
      });
      setReason("");
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleBanUser = async () => {
    if (reason.length < 10) {
      toast.error("Please enter a reason longer than 10 characters.");
      return;
    }

    banUser({
      userId: user.id,
      reason: reason,
    });
  };

  const handleUnbanUser = async () => {
    if (reason.length < 10) {
      toast.error("Please enter a reason longer than 10 characters.");
      return;
    }

    unbanUser({
      userId: user.id,
      reason: reason,
    });
  };

  const isUserBanned = user.ban;

  return (
    <>
      <ModalButton
        show={showModal}
        onClose={() => setShowModal(false)}
        openButton={
          <>
            {isUserBanned ? (
              <>
                <div className="rounded-full bg-red-500 px-2 text-white">
                  BANNED
                </div>
                <FaBan
                  className="cursor-pointer transition-all hover:text-orange-500"
                  onClick={() => setShowModal(true)}
                />
              </>
            ) : (
              <FaBan
                className="cursor-pointer transition-all hover:text-orange-500"
                onClick={() => setShowModal(true)}
              />
            )}
          </>
        }
      >
        <div>
          <div className="mb-4">
            <p>
              Please explain why you are{" "}
              {isUserBanned ? "unbanning" : "banning"} this user.
            </p>
            <textarea
              cols={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {isUserBanned ? (
            <Button
              text="Unban User"
              variant="plain"
              width="full"
              classNames="bg-emerald-600 mb-2 text-white py-2 px-4 hover:bg-emerald-500"
              onClick={handleUnbanUser}
            />
          ) : (
            <Button
              text="Ban User"
              variant="plain"
              width="full"
              classNames="bg-red-600 mb-2 text-white py-2 px-4 hover:bg-red-500"
              onClick={handleBanUser}
            />
          )}
          <Button
            text="Cancel"
            classNames=""
            variant="secondary"
            width="full"
            onClick={() => setShowModal(false)}
          />
        </div>
      </ModalButton>
    </>
  );
};

export default UserModMenu;
