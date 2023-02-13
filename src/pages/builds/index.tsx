import { BuildGrid } from "../../components/features/build";
import { useState } from "react";
import type { Attachment, Weapon } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import Spinner from "../../components/ui/Spinner";
import { DateRange, Sort } from "../../types/Filters";
import { useSession } from "next-auth/react";
import BuildFilters from "../../components/features/build/BuildFilters";
import type { BuildFromBuildGetAllResult } from "../../types/Builds";
import Button from "../../components/ui/Button";
import { queryTypes, useQueryState } from "next-usequerystate";

const BuildsPage = () => {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [dateRange, setDateRange] = useState(DateRange.ThisWeek);
  const [sortBy, setSortBy] = useQueryState(
    "view",
    queryTypes.stringEnum<Sort>(Object.values(Sort)).withDefault(Sort.Hot)
  );

  const { data: weapons, isLoading: isLoadingWeapons } =
    trpc.weapon.getAll.useQuery(undefined, {
      staleTime: 1000 * 60 * 60,
    });

  const { data: attachments, isLoading: isLoadingAttachments } =
    trpc.attachment.getAll.useQuery(undefined, {
      staleTime: 1000 * 60 * 60,
    });

  const {
    isLoading: isLoadingBuilds,
    data,
    fetchNextPage,
    hasNextPage,
  } = trpc.build.getAll.useInfiniteQuery(
    {
      limit: sortBy === Sort.Hot ? 36 : 9,
      weaponId: selectedWeapon?.id || null,
      attachmentIds:
        selectedAttachments.map((attachment) => attachment.id) || null,
      sort: sortBy,
      dateRange: dateRange,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor || null,
    }
  );

  const { data: session } = useSession();

  const { data: user } = trpc.user.getOne.useQuery({
    id: session?.user?.id || null,
  });

  const userFavorites = user?.favorites.map((favorite) => favorite.id) || null;

  const builds = data?.pages.map((page) => page?.items).flat() || [];

  const handleViewChange = (view: Sort) => {
    switch (view) {
      case Sort.Hot:
        setDateRange(DateRange.ThisMonth);
        break;
      case Sort.New:
        setDateRange(DateRange.AllTime);
        break;
    }

    setSortBy(view, {
      shallow: true,
      scroll: false,
    });
  };

  const handleWeaponChange = (weapon: Weapon | null) => {
    setSelectedWeapon(weapon);
  };

  const handleAttachmentsChange = (attachments: Attachment | Attachment[]) => {
    if (Array.isArray(attachments)) {
      setSelectedAttachments(attachments);
    } else {
      setSelectedAttachments((selected) =>
        selected.filter((a) => a.id !== attachments.id)
      );
    }
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    setDateRange(dateRange);
  };

  const handleFetchNextPage = () => {
    fetchNextPage();
  };

  return (
    <div className="py-4">
      <div className="px-4">
        <h1 className="mb-4">Browse All Builds</h1>
        {isLoadingWeapons ||
        isLoadingAttachments ||
        !weapons ||
        !attachments ? (
          <Spinner />
        ) : (
          <>
            <BuildFilters
              weapons={weapons}
              selectedWeapon={selectedWeapon}
              handleWeaponChange={handleWeaponChange}
              attachments={attachments}
              selectedAttachments={selectedAttachments}
              handleAttachmentsChange={handleAttachmentsChange}
              sortBy={sortBy}
              handleViewChange={handleViewChange}
              dateRange={dateRange}
              handleDateRangeChange={handleDateRangeChange}
            />
            {isLoadingBuilds || !data?.pages ? (
              <Spinner />
            ) : (
              <BuildGrid
                builds={builds as BuildFromBuildGetAllResult[]}
                userFavorites={userFavorites}
              />
            )}
          </>
        )}
        {hasNextPage && (
          <Button
            classNames="mt-4 mx-auto"
            onClick={handleFetchNextPage}
            text="Load More Builds"
          />
        )}
      </div>
    </div>
  );
};

export default BuildsPage;
