import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { IoMdHeart, IoMdHeartEmpty, IoMdStar } from "react-icons/io";
import Spinner from "../ui/Spinner";

import type { Attachment, Build, Weapon } from "@prisma/client";
import Panel from "../ui/Panel";

type BuildListProps = {
  userFavorites?: string[] | null;
};

const BuildsList = (props: BuildListProps) => {
  const { userFavorites } = props;

  const { data: builds, isLoading } = trpc.build.getAll.useQuery();

  if (isLoading || !builds) {
    return <Spinner />;
  }

  return (
    <div className="flex w-full flex-col">
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
  );
};

type BuildCardProps = {
  build: Build & {
    weapon: Weapon;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    attachments: Attachment[];
  };
  userFavorites?: string[] | null;
};

export const BuildCard = (props: BuildCardProps) => {
  const { build, userFavorites } = props;

  if (!build) return <Spinner />;

  const isFavorited = userFavorites?.includes(build.id) || false;

  return (
    <Panel>
      <Link href={`/builds/${build.id}`}>
        <div className="flex">
          <div className="flex basis-4/12 flex-col items-center justify-center gap-2">
            <div className="flex text-4xl">
              <span className="text-orange-500">
                <IoMdStar />
              </span>
              {build.averageRating.toFixed(1)}
            </div>
            <div className="text-center text-xs">
              {build.totalReviews}{" "}
              {build.totalReviews === 1 ? "Review" : "Reviews"}
            </div>
          </div>
          <div className="basis-8/12">
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
                {isFavorited ? <IoMdHeart /> : <IoMdHeartEmpty />}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Panel>
  );
};

export default BuildsList;
