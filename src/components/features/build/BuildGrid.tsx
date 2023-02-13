import Panel from "../../ui/Panel";
import type { BuildFromBuildGetAllResult } from "../../../types/Builds";
import { BuildCard } from "./BuildCard";

type BuildGridProps = {
  builds: BuildFromBuildGetAllResult[];
  userFavorites: string[] | null;
  emptyMessage?: string;
};

export const BuildGrid = (props: BuildGridProps) => {
  const { builds, userFavorites, emptyMessage = "No builds found." } = props;

  return (
    <>
      <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {builds.map((build, index) => {
          return (
            <BuildCard
              build={build}
              key={`build-${index}`}
              userFavorites={userFavorites}
            />
          );
        })}
      </div>
      {builds.length === 0 && (
        <Panel>
          <div className="text-center text-white">{emptyMessage}</div>
        </Panel>
      )}
    </>
  );
};

export default BuildGrid;
