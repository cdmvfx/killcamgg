import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { IoMdHeart, IoMdStar } from "react-icons/io";
import Spinner from "../ui/Spinner";

import type { Attachment, Weapon } from "@prisma/client";
import Panel from "../ui/Panel";
import type { SortOption } from "../../types/Filters";
import type { BuildWithReviewsAndAuthor } from "../../types/Builds";

type FilteredBuildGridProps = {
  userFavorites: string[] | null;
  selectedWeapons?: Weapon[];
  selectedAttachments?: Attachment[];
  sortBy: SortOption;
};

const FilteredBuildGrid = (props: FilteredBuildGridProps) => {
  const { userFavorites, selectedWeapons, selectedAttachments, sortBy } = props;

  const { data: builds, isLoading } = trpc.build.getAll.useQuery();

  if (isLoading || !builds) {
    return <Spinner />;
  }

  const filteredWeaponIds = selectedWeapons?.map((weapon) => weapon.id) || [];
  const filteredAttachmentIds =
    selectedAttachments?.map((attachment) => attachment.id) || [];

  const filteredBuilds = builds.filter((build) => {
    if (filteredWeaponIds.length > 0) {
      if (!filteredWeaponIds.includes(build.weaponId)) {
        return false;
      }
    }
    if (filteredAttachmentIds.length > 0) {
      for (const attachmentSetup of build.attachmentSetups) {
        if (!filteredAttachmentIds.includes(attachmentSetup.attachment.id)) {
          return false;
        }
      }
    }
    return true;
  });

  const sortedBuilds = filteredBuilds.sort((a, b) => {
    const sort = sortBy.value;

    switch (sort) {
      case "newest":
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "oldest":
        return a.updatedAt.getTime() - b.updatedAt.getTime();
      case "rating-asc":
        return a.averageRating - b.averageRating;
      case "rating-desc":
        return b.averageRating - a.averageRating;
      default:
        return 0;
    }
  });

  return <BuildGrid builds={sortedBuilds} userFavorites={userFavorites} />;
};

type BuildGridProps = {
  builds: BuildWithReviewsAndAuthor[];
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

export default FilteredBuildGrid;
