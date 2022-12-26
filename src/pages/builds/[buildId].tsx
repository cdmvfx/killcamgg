import Link from "next/link";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";
import UserAvatar from "../../components/ui/UserAvatar";
import { ReviewForm, ReviewList } from "../../components/features/Reviews";
import { IoMdHeart, IoMdHeartEmpty, IoMdStar } from "react-icons/io";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { prisma } from "../../server/db/client";
import { trpc } from "../../utils/trpc";
import { useState } from "react";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import type { Review } from "@prisma/client";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const BuildPage: NextPage<PageProps> = (props) => {
  const { build: initialBuildData, user: initialUserData } = props;

  const utils = trpc.useContext();

  const { data: build } = trpc.build.getOne.useQuery(
    { id: initialBuildData.id },
    {
      initialData: initialBuildData,
    }
  );

  if (!build) return <div>Build Not Found!</div>;

  const { data: user, refetch: refetchUserData } = trpc.user.getOne.useQuery(
    { id: initialUserData ? initialUserData.id : null },
    {
      enabled: false,
      initialData: initialUserData,
    }
  );

  const { mutate: toggleFavoriteMutation } =
    trpc.user.toggleFavorite.useMutation({
      onMutate: async (input) => {
        if (!user) return;
        await utils.user.getOne.cancel();
        const previousUser = utils.user.getOne.getData({ id: user.id });
        utils.user.getOne.setData({ id: user.id }, (oldUser) => {
          if (!oldUser) return null;

          if (
            oldUser.favorites.some((favorite) => favorite.id === input.buildId)
          ) {
            return {
              ...oldUser,
              favorites: oldUser.favorites.filter(
                (favorite) => favorite.id !== input.buildId
              ),
            };
          } else {
            return {
              ...oldUser,
              favorites: [...oldUser.favorites, build],
            };
          }
        });
        return { previousUser };
      },
      onSettled: async () => {
        if (!user) return;
        console.log("invalidating user");
        refetchUserData();
      },
      onError: async (err, input, context) => {
        console.log("Error favoriting build.", err);
        utils.user.getOne.setData(
          { id: user?.id as string },
          context?.previousUser
        );
      },
    });

  const changeFavorite = async () => {
    toggleFavoriteMutation({
      buildId: build.id,
    });
  };

  const isFavorited = user
    ? user.favorites.some((favorite) => favorite.id === build.id)
    : false;

  if (user === undefined) return <div>Loading user...</div>;

  const existingReview = build.reviews.find(
    (review) => review.authorId === user?.id
  );

  return (
    <main>
      <div>
        <div className="">
          {build && (
            <>
              <section className="flex flex-col gap-2 bg-neutral-800 p-4">
                <h1 className="mb-0">{build.title}</h1>
                <div className="w-fit">
                  <UserAvatar user={build.author} showAvatar={true} />
                </div>
                <div className="flex gap-8">
                  <div className="basis-1/2">
                    <label>Created</label>
                    <div>{new Date(build.createdAt).toDateString()}</div>
                  </div>
                  <div className="basis-1/2">
                    <label>Last Updated</label>
                    <div>{new Date(build.updatedAt).toDateString()}</div>
                  </div>
                </div>
              </section>
              <section className="p-4">
                <BuildRatingSummary
                  isFavorited={isFavorited}
                  changeFavorite={changeFavorite}
                  user={user}
                  build={build}
                />
                <BuildInfo build={build} />
                <BuildReviews
                  build={build}
                  user={user}
                  existingReview={existingReview}
                />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

const BuildRatingSummary = ({
  isFavorited,
  changeFavorite,
  user,
  build,
}: PageProps & {
  isFavorited: boolean;
  changeFavorite: () => void;
}) => {
  return (
    <section className="mb-4">
      <div className="mb-4 flex items-center justify-between ">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-4xl">
            <span className="text-orange-500">
              <IoMdStar />
            </span>{" "}
            5
          </div>
          <div className="">
            <div>1337 Ratings</div>
          </div>
        </div>
        {user && build.authorId === user.id ? (
          ""
        ) : (
          <div
            className="cursor-pointer text-4xl text-red-500"
            onClick={changeFavorite}
          >
            {isFavorited ? <IoMdHeart /> : <IoMdHeartEmpty />}
          </div>
        )}
      </div>
      <div className="">
        {user && build.authorId !== user.id && (
          <button className="mb-0 w-full ">Review this build!</button>
        )}
        {user && build.authorId === user.id && (
          <button className="mb-0 w-full ">Edit Build</button>
        )}
        {user === null && (
          <button className="w-full">
            <Link href={`/`}>Sign in to review this build!</Link>
          </button>
        )}
      </div>
    </section>
  );
};

const BuildInfo = ({ build }: Omit<PageProps, "user">) => {
  return (
    <section>
      <Heading>Build Information</Heading>
      <Panel>
        <div className="px-4">
          {build.description && (
            <div className="mb-4">
              <label>Description</label>
              <p>{build.description}</p>
            </div>
          )}
          <div className="mb-4">
            <label>{build.weapon.category}</label>
            <div>{build.weapon.name}</div>
          </div>
          <div>
            <div className="flex flex-col justify-center gap-4">
              {build.attachments.map((attachment, index) => {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-orange-600"></div>
                    <div className="flex flex-col">
                      <label>{attachment.category}</label>
                      <div>{attachment.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>{build.weapon.unlock_req}</div>
        </div>
      </Panel>
    </section>
  );
};

const BuildReviews = (props: PageProps & { existingReview?: Review }) => {
  const { build, user, existingReview } = props;

  const [showReviewForm, setShowReviewForm] = useState(
    existingReview ? false : true
  );

  return (
    <section>
      <Heading>Reviews</Heading>
      <div className="flex flex-col">
        {!user || (user && build.authorId !== user.id) ? (
          <Panel>
            <div className="px-4">
              {user === null && (
                <button className="w-full">
                  <Link href={`/`}>Sign in to review this build!</Link>
                </button>
              )}
              {user && build.authorId !== user.id && !showReviewForm && (
                <>
                  <button
                    className="w-full"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Edit Review
                  </button>
                </>
              )}
              {user && build.authorId !== user.id && showReviewForm && (
                <ReviewForm
                  build={build}
                  setShowReviewForm={setShowReviewForm}
                  existingReview={existingReview}
                  user={user}
                />
              )}
            </div>
          </Panel>
        ) : (
          ""
        )}
        {!build.reviews.length ? (
          <Panel>
            <div className="px-4">
              <div className="mb-2 text-center">No reviews yet!</div>
            </div>
          </Panel>
        ) : (
          <Panel>
            <div className="px-4">
              <ReviewList
                build={build}
                reviews={build.reviews}
                setShowReviewForm={setShowReviewForm}
              />
            </div>
          </Panel>
        )}
      </div>
    </section>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (
    !ctx.params ||
    !ctx.params.buildId ||
    typeof ctx.params.buildId !== "string"
  ) {
    return {
      notFound: true,
    };
  }

  const build = await prisma.build.findFirst({
    where: { id: ctx.params.buildId },
    include: {
      weapon: true,
      attachments: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      reviews: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!build) {
    return {
      notFound: true,
    };
  }

  const session = await getServerAuthSession(ctx);

  const user = session
    ? await prisma.user.findFirst({
        where: {
          id: session.user?.id,
        },
        include: {
          favorites: true,
        },
      })
    : null;

  return {
    props: { build, user },
  };
};

export default BuildPage;
