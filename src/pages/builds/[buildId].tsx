import Link from "next/link";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";
import UserAvatar from "../../components/ui/UserAvatar";
import { ReviewForm, ReviewList } from "../../components/features/Reviews";
import { IoMdHeart, IoMdHeartEmpty, IoMdStar } from "react-icons/io";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { prisma } from "../../server/db/client";
import { trpc } from "../../utils/trpc";
import React, { useState } from "react";
import BuildForm from "../../components/features/BuildForm";
import {
  MdThumbDownOffAlt,
  MdThumbUpOffAlt,
  MdThumbDown,
  MdThumbUp,
} from "react-icons/md";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import type { Review } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";
import Spinner from "../../components/ui/Spinner";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { isAuthorized as checkIfModOrAdmin } from "../../utils/isAuthorized";
import BuildModMenu from "../../components/features/BuildModMenu";
import StatusBadge from "../../components/ui/StatusBadge";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const BuildPage: NextPage<PageProps> = (props) => {
  const { build: initialBuildData, user: initialUserData } = props;

  const [showBuildForm, setShowBuildForm] = useState(false);

  const utils = trpc.useContext();

  const { data: build, refetch: refetchBuildData } = trpc.build.getOne.useQuery(
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

  if (user === undefined) return <div>Loading user...</div>;

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

  const { data: existingReview } = trpc.review.getOne.useQuery({
    buildId: build.id,
  });

  const isLiked = existingReview ? existingReview.isLike : null;

  return (
    <div>
      {build && (
        <div className="flex flex-col gap-4 md:gap-8 md:p-4">
          <BuildHeader
            user={user}
            build={build}
            isFavorited={isFavorited}
            changeFavorite={changeFavorite}
            averageRating={build.averageRating}
            showBuildForm={showBuildForm}
            setShowBuildForm={setShowBuildForm}
            isLiked={isLiked}
            refetchBuildData={refetchBuildData}
          />

          <BuildInfo build={build} />
          {existingReview === undefined ? (
            <Spinner />
          ) : (
            <BuildReviews
              build={build}
              user={user}
              existingReview={existingReview}
            />
          )}
        </div>
      )}
      <Transition appear show={showBuildForm} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowBuildForm(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full justify-center md:p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="min-h-full w-full max-w-lg transform overflow-hidden bg-[#274b48] p-4 text-left align-middle shadow-xl transition-all md:rounded-2xl">
                  <BuildForm
                    existingBuild={build}
                    setShowBuildForm={setShowBuildForm}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

const BuildHeader = ({
  user,
  build,
  isFavorited,
  changeFavorite,
  averageRating,
  setShowBuildForm,
  isLiked,
}: PageProps & {
  isFavorited: boolean;
  changeFavorite: () => void;
  averageRating: number;
  showBuildForm: boolean;
  setShowBuildForm: Dispatch<SetStateAction<boolean>>;
  isLiked: boolean | null;
  refetchBuildData: () => void;
}) => {
  const utils = trpc.useContext();

  const { mutate: toggleLikeMutation } = trpc.review.changeLike.useMutation({
    onMutate: async (input) => {
      await utils.review.getOne.cancel();
      const previousReview = utils.review.getOne.getData({
        buildId: input.buildId,
      });
      utils.review.getOne.setData({ buildId: input.buildId }, (oldReview) => {
        if (!oldReview) return null;
        return {
          ...oldReview,
          isLike: input.isLike,
        };
      });
      return { previousReview };
    },
    onSettled: async () => {
      console.log("settled. invalidating review.");
      utils.review.getOne.invalidate({ buildId: build.id });
      utils.build.getOne.invalidate({ id: build.id });
    },
    onError: async (err, input, context) => {
      console.log("Error changing like.", err);
      utils.review.getOne.setData(
        { buildId: input.buildId },
        context?.previousReview
      );
    },
  });

  const handleToggleLike = (status: boolean) => {
    console.log("isLike", isLiked, "status", status);
    if (
      (isLiked === true && status === true) ||
      (isLiked === false && status === false)
    ) {
      console.log("here");
      toggleLikeMutation({
        buildId: build.id,
        isLike: null,
      });
      return;
    }
    toggleLikeMutation({
      buildId: build.id,
      isLike: status,
    });
  };

  const isAuthorized = checkIfModOrAdmin(user);

  return (
    <section className="flex flex-col justify-between bg-black bg-opacity-50 md:flex-row md:rounded-lg">
      <div className="flex flex-col justify-center gap-4 p-4 md:basis-1/2 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="mb-0">{build.title}</h1>
            <div>{isAuthorized && <StatusBadge status={build.status} />}</div>
            <div className="w-fit">
              <UserAvatar user={build.author} showAvatar={true} />
            </div>
            <div className="flex flex-grow flex-col gap-4 ">
              <div className="flex gap-8">
                <div className="">
                  <label>
                    Created
                    <br />
                    {new Date(build.createdAt).toLocaleDateString()}
                  </label>
                </div>
                <div className="">
                  <label>
                    Last Updated
                    <br />
                    {new Date(build.updatedAt).toLocaleDateString()}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-4">
              {user && build.authorId === user.id ? (
                ""
              ) : (
                <>
                  <div className="flex-grow">
                    <div className="flex cursor-pointer text-4xl text-orange-400">
                      <div
                        className="p-2 text-emerald-500"
                        onClick={() => handleToggleLike(true)}
                      >
                        {isLiked === true ? <MdThumbUp /> : <MdThumbUpOffAlt />}
                      </div>
                      <div
                        className="p-2 text-red-500"
                        onClick={() => handleToggleLike(false)}
                      >
                        {isLiked === false ? (
                          <MdThumbDown />
                        ) : (
                          <MdThumbDownOffAlt />
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="cursor-pointer text-4xl text-red-500"
                    onClick={changeFavorite}
                  >
                    {isFavorited ? <IoMdHeart /> : <IoMdHeartEmpty />}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center text-4xl lg:text-6xl">
              <span className="text-orange-500">
                <IoMdStar />
              </span>{" "}
              {averageRating.toFixed(1) || "0.0"}
            </div>
            <div className="text-md lg:text-xl">
              {build.reviews.length + " "}
              {build.reviews.length === 1 ? "vote" : "votes"}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row">
          {user && user.id === build.authorId && (
            <button
              className="mb-0 w-full md:w-64"
              onClick={() => setShowBuildForm(true)}
            >
              Edit Build
            </button>
          )}
          {isAuthorized && <BuildModMenu build={build} />}
        </div>
      </div>
      <div className="hidden md:flex">
        <Image
          className=""
          alt="Build Gun Image"
          quality={100}
          style={{
            clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%)",
            borderRadius: "0 10px 10px 0",
          }}
          src="/images/ftac-recon.jpg"
          width={550}
          height={309}
        />
      </div>
    </section>
  );
};

const BuildInfo = ({ build }: Omit<PageProps, "user">) => {
  return (
    <section className="p-4 md:p-0">
      <Heading>Build Information</Heading>
      <Panel className="lg:p-8">
        <div className="build-info">
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
              {build.attachmentSetups.map((attachmentSetup, index) => {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-orange-600"></div>
                    <div className="flex flex-col">
                      <label>{attachmentSetup.attachment.category}</label>
                      <div>{attachmentSetup.attachment.name}</div>
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

const BuildReviews = (props: PageProps & { existingReview: Review | null }) => {
  const { build, user, existingReview } = props;

  const [showReviewForm, setShowReviewForm] = useState(
    existingReview ? false : true
  );

  console.log("Build Reviews Existing", existingReview, showReviewForm);

  return (
    <section className="p-4 md:p-0">
      <Heading>Reviews</Heading>
      <div className="flex flex-col gap-4">
        {!user && (
          <Link href="/signin">
            <button className="w-full">Sign in to review this build!</button>
          </Link>
        )}
        {user && build.authorId !== user.id && showReviewForm && (
          <Panel>
            <ReviewForm
              build={build}
              setShowReviewForm={setShowReviewForm}
              existingReview={existingReview}
              user={user}
            />
          </Panel>
        )}
        {!build.reviews.length ? (
          <Panel>
            <div className="text-center">No reviews yet!</div>
          </Panel>
        ) : (
          <Panel>
            <ReviewList
              build={build}
              reviews={build.reviews}
              setShowReviewForm={setShowReviewForm}
            />
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

  const build = await prisma.build.findUnique({
    where: { id: ctx.params.buildId },
    include: {
      weapon: true,
      attachmentSetups: {
        include: {
          attachment: true,
        },
      },
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
