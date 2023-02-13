import { BuildGrid } from "../../components/features/build";
import { trpc } from "../../utils/trpc";
import Spinner from "../../components/ui/Spinner";
import type { BuildFromBuildGetAllResult } from "../../types/Builds";
import React from "react";
import Heading from "../../components/ui/Heading";
import type {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import { createContextServerSideProps } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import Button from "../../components/ui/Button";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const UserBuildsPage: NextPage<PageProps> = (props) => {
  const { user, sessionUser } = props;

  const {
    isLoading: isLoadingBuilds,
    data,
    fetchNextPage,
    hasNextPage,
  } = trpc.user.getBuilds.useInfiniteQuery(
    {
      name: user.name as string,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor || null,
    }
  );

  const isCurrentUser = sessionUser && user.id === sessionUser.id;

  const userFavorites = user?.favorites.map((favorite) => favorite.id) || null;

  const builds = data?.pages.map((page) => page?.items).flat() || [];

  const handleFetchNextPage = () => {
    fetchNextPage();
  };

  return (
    <section className="p-4 md:p-0">
      <Heading>
        {isCurrentUser ? "Your Builds" : `${user.name}'s Builds`}
      </Heading>
      {isLoadingBuilds || !data?.pages ? (
        <Spinner />
      ) : (
        <BuildGrid
          builds={builds as BuildFromBuildGetAllResult[]}
          userFavorites={userFavorites}
        />
      )}
      {hasNextPage && (
        <Button
          classNames="mt-4 mx-auto"
          onClick={handleFetchNextPage}
          text="Load More Builds"
        />
      )}
    </section>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { params } = ctx;

  if (!params || !params.username || typeof params.username !== "string") {
    return {
      notFound: true,
    };
  }

  const trpcContext = await createContextServerSideProps(ctx);

  const caller = appRouter.createCaller(trpcContext);

  const sessionUser = await caller.user.getSelf();

  const user = await caller.user.getProfileData({
    name: params.username,
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return { props: { user, sessionUser } };
};

export default UserBuildsPage;
