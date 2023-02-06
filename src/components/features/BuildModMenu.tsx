import { Popover } from "@headlessui/react";
import { trpc } from "../../utils/trpc";
import Button from "../ui/Button";
import PopperButton from "../ui/PopperButton";
import Spinner from "../ui/Spinner";
import StatusBadge from "../ui/StatusBadge";

type Props = {
  buildId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const BuildModMenu = (props: Props) => {
  const { buildId, status } = props;

  const { mutate: approveBuildMutation, isLoading: approveBuildLoading } =
    trpc.build.approve.useMutation({
      onSuccess: () => {
        utils.build.getOne.invalidate({ id: buildId });
      },
    });

  const utils = trpc.useContext();

  const { mutate: rejectBuildMutation, isLoading: rejectBuildLoading } =
    trpc.build.reject.useMutation({
      onSuccess: () => {
        utils.build.getOne.invalidate({ id: buildId });
      },
    });

  const approveBuild = () => {
    approveBuildMutation({ id: buildId });
  };

  const rejectBuild = () => {
    rejectBuildMutation({ id: buildId });
  };

  const isLoading = approveBuildLoading || rejectBuildLoading;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <PopperButton
            showOn="click"
            button={<StatusBadge status={status} />}
            tooltip={
              <>
                <Button
                  text="Approve Build"
                  onClick={approveBuild}
                  variant="plain"
                  width="full"
                  classNames="mb-4 bg-emerald-600 hover:bg-emerald-500 border-transparent"
                />
                <Button
                  text="Reject Build"
                  onClick={rejectBuild}
                  width="full"
                  variant="plain"
                  classNames="bg-red-600 hover:bg-red-500 border-transparent"
                />
              </>
            }
          />
        </>
      )}
    </>
  );
};

export default BuildModMenu;
