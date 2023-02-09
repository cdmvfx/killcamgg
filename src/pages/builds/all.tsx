import { BuildGrid } from "../../components/features/build";
import { useState } from "react";
import type { Attachment, Weapon } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import Spinner from "../../components/ui/Spinner";
import { DateRange, Sort } from "../../types/Filters";
import { useSession } from "next-auth/react";
import BuildFilters from "../../components/features/build/BuildFilters";
import type { WeaponsByCategory } from "../../types/Weapons";
import type { AttachmentsByCategory } from "../../types/Attachments";

const AllBuildsPage = () => {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [dateRange, setDateRange] = useState(DateRange.ThisWeek);
  const [sortBy, setSortBy] = useState(Sort.Hot);
  const [cursor, setCursor] = useState<string | null>(null);

  const { data: weaponsByCategory, isLoading: isLoadingWeapons } =
    trpc.weapon.getAllByCategory.useQuery();

  const { data: attachmentsByCategory, isLoading: isLoadingAttachments } =
    trpc.attachment.getAllByCategory.useQuery();

  const { data: builds, isLoading: isLoadingBuilds } =
    trpc.build.getAll.useQuery({
      weaponId: selectedWeapon?.id || null,
      attachmentIds:
        selectedAttachments.map((attachment) => attachment.id) || null,
      sort: sortBy,
      dateRange: dateRange,
      cursor: cursor,
    });

  const { data: session } = useSession();

  const { data: user } = trpc.user.getOne.useQuery({
    id: session?.user?.id || null,
  });

  const userFavorites = user?.favorites.map((favorite) => favorite.id) || null;

  const loadMore = () => {
    if (!builds) return;
    const lastEntry = builds[builds.length - 1];
    if (lastEntry) setCursor(lastEntry.id);
  };

  console.log("Filters", {
    selectedWeapon,
    selectedAttachments,
    dateRange,
    sortBy,
    cursor,
  });
  console.log("Results", builds);

  return (
    <div className="py-4">
      <div className="px-4">
        <h1 className="mb-4">Browse All Builds</h1>
        {isLoadingWeapons || isLoadingAttachments ? (
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
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            {isLoadingBuilds || !builds ? (
              <Spinner />
            ) : (
              <BuildGrid builds={builds} userFavorites={userFavorites} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllBuildsPage;
