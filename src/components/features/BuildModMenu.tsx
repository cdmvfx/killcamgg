import { Popover } from "@headlessui/react";
import { trpc } from "../../utils/trpc";
import Spinner from "../ui/Spinner";

type Props = {
  buildId: string;
};

const BuildModMenu = (props: Props) => {
  const { buildId } = props;

  const { mutate: approveBuildMutation, isLoading: approveBuildLoading } =
    trpc.build.approve.useMutation({
      onSuccess: () => {
        alert("Build approved!");
      },
    });

  const { mutate: rejectBuildMutation, isLoading: rejectBuildLoading } =
    trpc.build.reject.useMutation({
      onSuccess: () => {
        alert("Build rejected!");
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
        <Popover className="relative">
          <Popover.Button className="mb-0 md:w-48">Mod Actions</Popover.Button>

          <Popover.Panel className="absolute z-10 md:w-48">
            <div className="w-full rounded-lg bg-neutral-900 p-4 md:w-48">
              <button
                className="w-full border-transparent bg-emerald-500 "
                onClick={() => approveBuild()}
              >
                Approve Build
              </button>
              <button
                className="w-full border-transparent bg-red-500 "
                onClick={() => rejectBuild()}
              >
                Reject Build
              </button>
            </div>
          </Popover.Panel>
        </Popover>
      )}
    </>
  );
};

export default BuildModMenu;
