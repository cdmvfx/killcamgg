import { BuildGrid } from "../../components/features/build";
import { useState } from "react";
import type { Attachment, Weapon } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import Spinner from "../../components/ui/Spinner";
import type { SortOption } from "../../types/Filters";
import { useSession } from "next-auth/react";
import BuildFilters from "../../components/features/build/BuildFilters";
import type { WeaponsByCategory } from "../../types/Weapons";
import type { AttachmentsByCategory } from "../../types/Attachments";

const NewBuildsPage = () => {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [sortBy, setSortBy] = useState<SortOption>({
    name: "Newest",
    value: "newest",
  });

  const { data: weaponsByCategory, isLoading: isLoadingWeapons } =
    trpc.weapon.getAllByCategory.useQuery();

  const { data: attachmentsByCategory, isLoading: isLoadingAttachments } =
    trpc.attachment.getAllByCategory.useQuery();

  const { data: builds, isLoading: isLoadingBuilds } =
    trpc.build.getAll.useQuery();

  const { data: session } = useSession();

  const { data: user } = trpc.user.getOne.useQuery({
    id: session?.user?.id || null,
  });

  if (isLoadingWeapons || isLoadingAttachments || isLoadingBuilds || !builds) {
    return <Spinner />;
  }

  const userFavorites = user?.favorites.map((favorite) => favorite.id) || null;

  const filteredAttachmentIds = selectedAttachments.map(
    (attachment) => attachment.id
  );

  const filteredBuilds = builds.filter((build) => {
    if (selectedWeapon) {
      if (selectedWeapon.id !== build.weaponId) {
        return false;
      }
    }
    if (selectedAttachments.length > 0) {
      for (const attachmentSetup of build.attachmentSetups) {
        if (!filteredAttachmentIds.includes(attachmentSetup.attachment.id)) {
          return false;
        }
      }
    }
    return true;
  });

  const sortedBuilds = filteredBuilds?.sort((a, b) => {
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

  return (
    <div className="py-4">
      <div className="px-4">
        <h1 className="mb-4">Browse New Builds</h1>
        {isLoadingWeapons || isLoadingAttachments || isLoadingBuilds ? (
          <Spinner />
        ) : (
          <>
            <BuildGrid builds={sortedBuilds} userFavorites={userFavorites} />
          </>
        )}
      </div>
    </div>
  );
};

export default NewBuildsPage;
