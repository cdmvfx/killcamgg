import { trpc } from "../../utils/trpc";
import Spinner from "../../components/ui/Spinner";
import Heading from "../../components/ui/Heading";
import type {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import { createContextServerSideProps } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import Button from "../../components/ui/Button";
import Panel from "../../components/ui/Panel";
import { ReviewGrid } from "../../components/features/reviews";
import type { Build, Review } from "@prisma/client";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const UserReviewsPage: NextPage<PageProps> = (props) => {
  const { user, sessionUser } = props;

  const {
    isLoading: isLoadingReviews,
    data,
    fetchNextPage,
    hasNextPage,
  } = trpc.user.getReviews.useInfiniteQuery(
    {
      name: user.name as string,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor || null,
    }
  );

  const isCurrentUser = sessionUser && user.id === sessionUser.id;

  const reviews = data?.pages.map((page) => page?.items).flat() || [];

  const handleFetchNextPage = () => {
    fetchNextPage();
  };

  return (
    <section className="p-4 md:p-0">
      <Heading>
        {isCurrentUser ? "Your Reviews" : `${user.name}'s Reviews`}
      </Heading>
      {isLoadingReviews || !data?.pages ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-4">
          {user.reviews.length === 0 ? (
            <Panel>
              <div className="text-center">No reviews yet!</div>
            </Panel>
          ) : (
            <ReviewGrid reviews={reviews as (Review & { build: Build })[]} />
          )}
        </div>
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

export default UserReviewsPage;
