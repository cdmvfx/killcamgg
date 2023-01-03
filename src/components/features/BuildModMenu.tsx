import { Popover } from "@headlessui/react";
import React from "react";
import type { BuildGetOneResult } from "../../types/Builds";
import { trpc } from "../../utils/trpc";
import Panel from "../ui/Panel";
import Spinner from "../ui/Spinner";

type Props = {
  build: BuildGetOneResult;
};

const BuildModMenu = (props: Props) => {
  const { build } = props;

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
    if (!build) return;
    approveBuildMutation({ id: build.id });
  };

  const rejectBuild = () => {
    if (!build) return;
    rejectBuildMutation({ id: build.id });
  };

  const isLoading = approveBuildLoading || rejectBuildLoading;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <Popover className="relative">
          <Popover.Button className="mb-0">Mod Actions</Popover.Button>

          <Popover.Panel className="absolute z-10 md:w-64">
            <div className="w-full rounded-lg bg-neutral-900 p-4 md:w-64">
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
