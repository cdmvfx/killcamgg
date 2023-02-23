import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import ModalButton from "../../ui/ModalButton";
import Spinner from "../../ui/Spinner";
import toast from "react-hot-toast";
import { MdReportProblem } from "react-icons/md";

const ReportUser = (props: { userId: string }) => {
  const { userId } = props;

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate, isLoading } = trpc.user.report.useMutation({
    onSuccess: () => {
      toast.success("User reported.");
      setReason("");
      setShowModal(false);
    },
    onError: () => {
      toast.error("Failed to report user.");
    },
  });

  const handleReport = () => {
    mutate({ userId, reason });
  };

  return (
    <ModalButton
      show={showModal}
      onClose={() => setShowModal(false)}
      openButton={
        <MdReportProblem
          className="cursor-pointer transition-all hover:text-orange-500"
          onClick={() => setShowModal(true)}
        />
      }
    >
      <div>
        <div className="mb-4">
          <p>Please explain why you are reporting this user.</p>
          <textarea
            cols={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <Button
              text="Report"
              classNames="mb-2"
              variant="primary"
              onClick={handleReport}
              width="full"
            />
            <Button
              text="Cancel"
              classNames=""
              variant="secondary"
              width="full"
              onClick={() => setShowModal(false)}
            />
          </>
        )}
      </div>
    </ModalButton>
  );
};

export default ReportUser;
