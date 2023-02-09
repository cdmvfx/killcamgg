import Link from "next/link";
import { IoMdHeart, IoMdStar } from "react-icons/io";
import Spinner from "../../ui/Spinner";
import Panel from "../../ui/Panel";
import type { BuildWithReviewsAndAuthor } from "../../../types/Builds";

type BuildCardProps = {
  build: BuildWithReviewsAndAuthor;
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
        <div className="flex gap-4">
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
              <div className="text-lg">
                <p>
                  {build.title.length > 20
                    ? build.title.substring(0, 20) + "..."
                    : build.title}
                </p>
              </div>
              <div className="text-xs">
                by <span className="text-orange-500">{build.author.name}</span>{" "}
                -{" "}
                {build.updatedAt === build.createdAt
                  ? new Date(build.createdAt).toLocaleDateString()
                  : new Date(build.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="p-2">
                <div className="mb-2">{build.weapon.name}</div>
                <div className="flex w-full flex-row gap-2 ">
                  {build.attachmentSetups.map((attachmentSetup, index) => {
                    return (
                      <div key={index} className="text-sm">
                        <div className="h-4 w-4 bg-orange-500"></div>
                      </div>
                    );
                  })}
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
