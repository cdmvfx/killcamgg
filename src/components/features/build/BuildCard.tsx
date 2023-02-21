import Link from "next/link";
import { IoMdHeart, IoMdStar } from "react-icons/io";
import Spinner from "../../ui/Spinner";
import Panel from "../../ui/Panel";
import type { BuildFromBuildGetAllResult } from "../../../types/Builds";
import { FaThumbsUp } from "react-icons/fa";
import {
  MdThumbDownOffAlt,
  MdThumbUpOffAlt,
  MdThumbDown,
  MdThumbUp,
} from "react-icons/md";

type BuildCardProps = {
  build: BuildFromBuildGetAllResult;
  userFavorites?: string[] | null;
};

export const BuildCard = (props: BuildCardProps) => {
  const { build, userFavorites } = props;

  if (!build) return <Spinner />;

  const isFavorited = userFavorites?.includes(build.id) || false;

  return (
    <Link
      href={`/builds/${build.id}`}
      className="rounded-md border border-transparent transition-all hover:border-orange-600 hover:shadow-lg md:basis-1/2"
    >
      <Panel>
        <div className="grid grid-cols-[8rem,auto]">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex font-jost text-4xl">
              <span className="text-orange-500">
                <IoMdStar />
              </span>
              {build.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-emerald-500">
                <MdThumbUp />
                {build.totalLikes}
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <MdThumbDown />
                {build.totalDislikes}
              </div>
            </div>
          </div>
          <div className="truncate">
            <div className="p-2">
              <div className=" w-full truncate  font-jost text-lg">
                {build.title}
              </div>
              <div className="text-xs">
                by{" "}
                <span className="text-orange-500">
                  {build.author.displayName}
                </span>{" "}
                - {build.updatedAt.toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="p-2">
                <label className="mb-1">{build.weapon.name}</label>
                <div className="flex w-full flex-row gap-2 ">
                  {Array.from(Array(build._count.attachmentSetups)).map(
                    (attachmentSetup, index) => {
                      return (
                        <div key={index} className="text-sm">
                          <div
                            className="h-4 w-4 bg-orange-500"
                            style={{
                              clipPath:
                                "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
                            }}
                          ></div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="p-2 text-2xl text-red-500">
                {isFavorited ? <IoMdHeart /> : ""}
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </Link>
  );
};
