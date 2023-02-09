import { trpc } from "../../../utils/trpc";
import Spinner from "../../ui/Spinner";
import type { Attachment, Weapon } from "@prisma/client";
import type { SortOption } from "../../../types/Filters";
import { BuildGrid } from "./BuildGrid";

type FilteredBuildGridProps = {
  userFavorites: string[] | null;
  selectedWeapon?: Weapon | null;
  selectedAttachments?: Attachment[];
  sortBy: SortOption;
};

const FilteredBuildGrid = (props: FilteredBuildGridProps) => {
  const {
    userFavorites,
    selectedWeapon = null,
    selectedAttachments,
    sortBy,
  } = props;

  const { data: builds, isLoading } = trpc.build.getAll.useQuery();

  if (isLoading || !builds) {
    return <Spinner />;
  }

  const filteredWeaponId = selectedWeapon?.id;
  const filteredAttachmentIds =
    selectedAttachments?.map((attachment) => attachment.id) || [];

  const filteredBuilds = builds.filter((build) => {
    if (filteredWeaponId) {
      if (filteredWeaponId !== build.weaponId) {
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

export default FilteredBuildGrid;
