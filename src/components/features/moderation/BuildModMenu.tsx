import { FaChevronCircleDown } from "react-icons/fa";
import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import PopperButton from "../../ui/PopperButton";
import Spinner from "../../ui/Spinner";

type Props = {
  buildId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const BuildModMenu = (props: Props) => {
  const { buildId, status } = props;

  const utils = trpc.useContext();

  const { mutate: approveBuildMutation, isLoading: approveBuildLoading } =
    trpc.mod.approveBuild.useMutation({
      onSuccess: () => {
        utils.build.getOne.invalidate({ id: buildId });
      },
    });

  const { mutate: rejectBuildMutation, isLoading: rejectBuildLoading } =
    trpc.mod.rejectBuild.useMutation({
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
            tooltip={
              <>
                <div className="flex w-full justify-end">
                  {status === "APPROVED" && (
                    <Button
                      text="Reject Build"
                      variant="plain"
                      classNames="bg-red-600 text-white py-2 px-4 hover:bg-red-500"
                      onClick={rejectBuild}
                    />
                  )}
                  {status === "REJECTED" && (
                    <Button
                      text="Approve Build"
                      variant="plain"
                      classNames="bg-emerald-600 text-white py-2 px-4 hover:bg-emerald-500"
                      onClick={approveBuild}
                    />
                  )}
                </div>
              </>
            }
            button={<FaChevronCircleDown />}
          />
        </>
      )}
    </>
  );
};

export default BuildModMenu;
