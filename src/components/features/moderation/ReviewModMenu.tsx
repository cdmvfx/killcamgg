import { FaChevronCircleDown } from "react-icons/fa";
import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import PopperButton from "../../ui/PopperButton";
import { useState } from "react";

const ReviewModMenu = ({
  reviewId,
  buildId,
}: {
  reviewId: string;
  buildId: string;
}) => {
  const [reason, setReason] = useState<string>("");

  const utils = trpc.useContext();

  const { mutate: deleteReview } = trpc.mod.deleteReview.useMutation({
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

  const handleDeleteReview = async () => {
    deleteReview({
      reviewId,
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
              onClick={handleDeleteReview}
            />
          </div>
        </>
      }
      button={<FaChevronCircleDown />}
    />
  );
};

export default ReviewModMenu;
