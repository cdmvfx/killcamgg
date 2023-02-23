import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import ModalButton from "../../ui/ModalButton";
import Spinner from "../../ui/Spinner";
import toast from "react-hot-toast";
import { MdReportProblem } from "react-icons/md";

const ReportBuild = (props: { buildId: string }) => {
  const { buildId } = props;

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate, isLoading } = trpc.build.report.useMutation({
    onSuccess: () => {
      toast.success("Build reported.");
      setReason("");
      setShowModal(false);
    },
    onError: () => {
      toast.error("Failed to report build.");
    },
  });

  const handleReport = () => {
    mutate({ buildId, reason });
  };

  return (
    <>
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
            <p>Please explain why you are reporting this build.</p>
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
    </>
  );
};

export default ReportBuild;
