import type { Attachment, Build, User, Weapon } from "@prisma/client";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { IoMdHeart, IoMdHeartEmpty, IoMdStar } from "react-icons/io";
import { ReviewCard } from "../../components/features/Reviews";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";
import UserAvatar from "../../components/ui/UserAvatar";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { prisma } from "../../server/db/client";
import type { CompleteReviewData } from "../../types/Reviews";
import { trpc } from "../../utils/trpc";

type BuildData = Build & {
  weapon: Weapon;
  author: User;
  attachments: Attachment[];
  reviews: CompleteReviewData[];
};

type BuildPageProps = {
  build: BuildData;
  user:
    | (User & {
        favorites: BuildData[];
      })
    | null;
};

const BuildPage = (props: BuildPageProps) => {
  const { build, user } = props;

  const { mutate: toggleFavoriteMutation } =
    trpc.user.toggleFavorite.useMutation();

  const isFavorited = user
    ? user?.favorites.some((favorite) => favorite.id === build.id)
    : false;

  const changeFavorite = async () => {
    if (!user) return;

    if (isFavorited) {
      user.favorites = user.favorites.filter(
        (favorite) => favorite.id !== build.id
      );
    } else {
      user.favorites.push(build);
    }

    await toggleFavoriteMutation({
      buildId: build.id,
    });
  };

  console.log("Build data", build);
  console.log("User data", user);

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
              <div className="p-4">
                <BuildRatingSummary
                  isFavorited={isFavorited}
                  changeFavorite={changeFavorite}
                  user={user}
                  build={build}
                />
                <BuildInfo build={build} />
                <BuildReviews build={build} user={user} />
              </div>
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
}: {
  isFavorited: boolean;
  changeFavorite: () => void;
  user: User | null;
  build: BuildData;
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

const BuildInfo = ({ build }: { build: BuildData }) => {
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

const BuildReviews = ({
  build,
  user,
}: {
  build: BuildData;
  user: User | null;
}) => {
  return (
    <section>
      <Heading>Reviews</Heading>
      <div>
        {!build.reviews.length ? (
          <Panel>
            <div className="px-4">
              <div className="mb-2 text-center">No reviews yet!</div>
              {user === null && (
                <button className="w-full">
                  <Link href={`/`}>Sign in to review this build!</Link>
                </button>
              )}
              {user && build.authorId !== user.id && (
                <button className="w-full">Review this build!</button>
              )}
            </div>
          </Panel>
        ) : (
          <div>
            {build.reviews.map((review) => (
              <ReviewCard
                key={`build-review-${review.id}`}
                build={build}
                review={review}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (
    !ctx.params ||
    !ctx.params.buildId ||
    typeof ctx.params.buildId !== "string"
  ) {
    return {
      notFound: true,
    };
  }

  const buildInfo = await prisma.build.findFirst({
    where: { id: ctx.params.buildId },
    include: {
      weapon: true,
      attachments: true,
      author: true,
      reviews: {
        include: {
          author: true,
        },
      },
    },
  });

  if (!buildInfo) {
    return {
      notFound: true,
    };
  }

  const session = await getServerAuthSession(ctx);

  console.log("session", session);

  const user = await prisma.user.findFirst({
    where: {
      id: session?.user?.id,
    },
    include: {
      favorites: true,
    },
  });

  const buildSerialized = JSON.parse(JSON.stringify(buildInfo));
  const userSerialized = JSON.parse(JSON.stringify(user));

  return {
    props: { build: buildSerialized, user: session ? userSerialized : null },
  };
};

export default BuildPage;
