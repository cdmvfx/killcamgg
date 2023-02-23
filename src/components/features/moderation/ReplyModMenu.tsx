import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import PopperButton from "../../ui/PopperButton";
import { useState } from "react";

const ReplyModMenu = ({
  replyId,
  buildId,
}: {
  replyId: string;
  buildId: string;
}) => {
  const [reason, setReason] = useState<string>("");

  const utils = trpc.useContext();

  const { mutate: deleteReply } = trpc.mod.deleteReply.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({
        id: buildId,
      });
      setReason("");
    },
    onError: (error) => {
      alert(error.message);
      console.log(error);
    },
  });

  const handleDeleteReply = async () => {
    deleteReply({
      replyId,
      reason,
    });
  };

  return (
    <PopperButton
      showOn="click"
      tooltip={
        <>
          <label>Enter a reason why you are deleting this review.</label>
          <input
            type="text"
            className="mb-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex w-full justify-end">
            <Button
              text="Delete Review"
              variant="plain"
              classNames="bg-red-600 text-white py-2 px-4 hover:bg-red-500"
              onClick={handleDeleteReply}
            />
          </div>
        </>
      }
      button={
        <span className="font-bold transition-all hover:text-orange-500">
          Mod Delete
        </span>
      }
    />
  );
};

export default ReplyModMenu;
