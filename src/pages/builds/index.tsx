import { FilteredBuildGrid } from "../../components/features/build";
import { useState } from "react";
import type { Attachment, Weapon } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import Spinner from "../../components/ui/Spinner";
import type { SortOption } from "../../types/Filters";
import { useSession } from "next-auth/react";
import BuildFilters from "../../components/features/build/BuildFilters";
import type { WeaponsByCategory } from "../../types/Weapons";
import type { AttachmentsByCategory } from "../../types/Attachments";

const Builds = () => {
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

  const { data: session } = useSession();

  const { data: user } = trpc.user.getOne.useQuery({
    id: session?.user?.id || null,
  });

  const userFavorites = user?.favorites.map((favorite) => favorite.id) || null;

  return (
    <div className="py-4">
      <div className="px-4">
        <h1 className="mb-4">Browse All Builds</h1>
        {isLoadingWeapons && isLoadingAttachments ? (
          <Spinner />
        ) : (
          <>
            <BuildFilters
              weaponsByCategory={weaponsByCategory as WeaponsByCategory}
              selectedWeapon={selectedWeapon}
              setSelectedWeapon={setSelectedWeapon}
              attachmentsByCategory={
                attachmentsByCategory as AttachmentsByCategory
              }
              selectedAttachments={selectedAttachments}
              setSelectedAttachments={setSelectedAttachments}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <FilteredBuildGrid
              userFavorites={userFavorites}
              selectedWeapon={selectedWeapon}
              selectedAttachments={selectedAttachments}
              sortBy={sortBy}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Builds;
