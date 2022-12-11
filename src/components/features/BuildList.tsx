import Link from "next/link";
import type { CompleteBuildData } from "../../types/Builds";
import { trpc } from "../../utils/trpc";
import { IoMdHeart, IoMdHeartEmpty, IoMdStar } from "react-icons/io";

const BuildsList = () => {
  const { data: builds, isLoading } = trpc.build.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const buildsData: CompleteBuildData[] = JSON.parse(JSON.stringify(builds));
  return (
    <div className="flex w-full flex-col gap-4">
      {buildsData.map((build, index) => {
        return <BuildCard build={build} key={`build-${index}`} />;
      })}
    </div>
  );
};

type BuildCardProps = {
  build: CompleteBuildData;
};

export const BuildCard = (props: BuildCardProps) => {
  const { build } = props;

  return (
    <div className="w-full cursor-pointer bg-neutral-800">
      <Link href={`/builds/${build.id}`}>
        <div className="min-h-36 flex py-2">
          <div className="flex basis-4/12 flex-col items-center justify-center gap-2 px-2">
            <div className="flex text-4xl">
              <span className="text-orange-500">
                <IoMdStar />
              </span>
              5.0
            </div>
            <div className="text-center text-xs">1337 Ratings</div>
          </div>
          <div className="basis-8/12 px-2">
            <div className="p-2">
              <div className="text-xl">
                <p>{build.title}</p>
              </div>
              <div className="text-xs">
                by <span className="text-orange-500">{build.author.name}</span>{" "}
                -{" "}
                {build.updatedAt === build.createdAt
                  ? new Date(build.createdAt).toDateString()
                  : new Date(build.updatedAt).toDateString()}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="p-2">
                <div className="mb-2">{build.weapon.name}</div>
                <div className="flex w-full flex-row gap-2 ">
                  {build.attachments.map((attachment, index) => {
                    return (
                      <div key={index} className="text-sm">
                        <div className="h-4 w-4 bg-orange-500"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-2 text-2xl text-red-500">
                {true ? <IoMdHeart /> : <IoMdHeartEmpty />}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BuildsList;
