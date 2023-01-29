import Link from "next/link";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";
import UserAvatar from "../../components/ui/UserAvatar";
import { ReviewList } from "../../components/features/Reviews";
import { IoMdHeart, IoMdHeartEmpty, IoMdStar } from "react-icons/io";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
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
import type { Dispatch, SetStateAction } from "react";
import Spinner from "../../components/ui/Spinner";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { isAuthorized as checkIfModOrAdmin } from "../../utils/isAuthorized";
import BuildModMenu from "../../components/features/BuildModMenu";
import StatusBadge from "../../components/ui/StatusBadge";
import { FaArrowsAltH, FaArrowsAltV, FaLink } from "react-icons/fa";
import { copyToClipboard } from "../../utils/copyToClipboard";
import Toast from "../../components/ui/Toast";
import type { ReviewFromBuildGetOneResult } from "../../types/Reviews";
import { appRouter } from "../../server/trpc/router/_app";
import { createContextServerSideProps } from "../../server/trpc/context";
import { ReviewForm } from "../../components/features/reviews/ReviewForm";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const BuildPage: NextPage<PageProps> = (props) => {
  const { build: initialBuildData, sessionUser } = props;

  const [showBuildForm, setShowBuildForm] = useState(false);

  const [isCopyBuildToastOpen, setIsCopyBuildToastOpen] = useState(false);

  const utils = trpc.useContext();

  const { data: build, refetch: refetchBuildData } = trpc.build.getOne.useQuery(
    { id: initialBuildData.id },
    {
      enabled: false,
      initialData: initialBuildData,
    }
  );

  if (!build) return <div>Build Not Found!</div>;

  const { mutate: toggleFavoriteMutation } =
    trpc.build.toggleFavorite.useMutation({
      onMutate: async (input) => {
        await utils.build.getOne.cancel();
        const previousBuild = utils.build.getOne.getData({ id: build.id });

        utils.build.getOne.setData({ id: build.id }, (oldBuild) => {
          if (!oldBuild) return null;
          if (!sessionUser) return;

          if (!input.status) {
            return {
              ...oldBuild,
              favorites: oldBuild.favorites.filter(
                (favorite) => favorite.id !== sessionUser.id
              ),
            };
          }

          return {
            ...oldBuild,
            favorites: [...oldBuild.favorites, { id: sessionUser.id }],
          };
        });
        return { previousBuild };
      },
      onSettled: async () => {
        if (!sessionUser) return;
        refetchBuildData();
      },
      onError: async (err, input, context) => {
        utils.build.getOne.setData(
          { id: build.id as string },
          context?.previousBuild
        );
      },
    });

  const existingReview = sessionUser
    ? build.reviews.find((review) => review.author.id === sessionUser.id) ||
      null
    : null;

  const isFavorited = sessionUser
    ? build.favorites.some((favorite) => favorite.id === sessionUser.id) ||
      false
    : false;

  const isLiked = existingReview ? existingReview.isLike : null;

  const changeFavorite = async () => {
    toggleFavoriteMutation({
      buildId: build.id,
      status: !isFavorited,
    });
  };

  return (
    <div>
      <Toast
        isVisible={isCopyBuildToastOpen}
        setIsVisible={setIsCopyBuildToastOpen}
        status="success"
        message="Successfully copied build URL!"
      />
      {build && (
        <div className="flex flex-col gap-4 md:gap-8 md:p-4">
          <BuildHeader
            sessionUser={sessionUser}
            build={build}
            isFavorited={isFavorited}
            changeFavorite={changeFavorite}
            averageRating={build.averageRating}
            showBuildForm={showBuildForm}
            setShowBuildForm={setShowBuildForm}
            isLiked={isLiked}
            refetchBuildData={refetchBuildData}
            setIsCopyBuildToastOpen={setIsCopyBuildToastOpen}
          />

          <BuildInfo build={build} />
          {existingReview === undefined ? (
            <Spinner />
          ) : (
            <BuildReviews
              build={build}
              sessionUser={sessionUser}
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
  sessionUser,
  build,
  isFavorited,
  changeFavorite,
  averageRating,
  setShowBuildForm,
  isLiked,
  setIsCopyBuildToastOpen,
  refetchBuildData,
}: PageProps & {
  isFavorited: boolean;
  changeFavorite: () => void;
  averageRating: number;
  showBuildForm: boolean;
  setShowBuildForm: Dispatch<SetStateAction<boolean>>;
  isLiked: boolean | null;
  refetchBuildData: () => void;
  setIsCopyBuildToastOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const utils = trpc.useContext();

  const { mutate: toggleLikeMutation } = trpc.review.changeLike.useMutation({
    onMutate: async (input) => {
      await utils.build.getOne.cancel();
      const previousBuild = utils.build.getOne.getData({
        id: input.buildId,
      });
      return { previousBuild };
    },
    onSettled: async () => {
      refetchBuildData();
    },
    onError: async (err, input, context) => {
      utils.build.getOne.setData({ id: input.buildId }, context?.previousBuild);
    },
  });

  const handleToggleLike = (status: boolean) => {
    if (
      (isLiked === true && status === true) ||
      (isLiked === false && status === false)
    ) {
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

  const isAuthorized = checkIfModOrAdmin(sessionUser);

  const numLikes = build.reviews.filter(
    (review) => review.isLike === true
  ).length;
  const numDislikes = build.reviews.length - numLikes;

  return (
    <section className="flex flex-col justify-between bg-black bg-opacity-50 md:flex-row md:rounded-lg">
      <div className="flex flex-col justify-center gap-4 p-4 md:basis-1/2 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="flex items-center text-4xl lg:text-6xl">
                <span className="text-orange-500">
                  <IoMdStar />
                </span>{" "}
                {averageRating.toFixed(1) || "0.0"}
              </div>
            </div>
            <h1 className="mb-0 flex gap-4">{build.title}</h1>
            {isAuthorized && (
              <div>
                <StatusBadge status={build.status} />
              </div>
            )}
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
              {sessionUser && build.authorId === sessionUser.id ? (
                ""
              ) : (
                <>
                  <div className="flex-grow">
                    <div className="grid cursor-pointer grid-cols-3 text-4xl text-orange-400">
                      <div
                        className="flex gap-2 p-2 text-emerald-500"
                        onClick={() => handleToggleLike(true)}
                      >
                        {isLiked === true ? <MdThumbUp /> : <MdThumbUpOffAlt />}{" "}
                        {numLikes}
                      </div>
                      <div
                        className="flex gap-2 p-2 text-red-500"
                        onClick={() => handleToggleLike(false)}
                      >
                        {isLiked === false ? (
                          <MdThumbDown />
                        ) : (
                          <MdThumbDownOffAlt />
                        )}{" "}
                        {numDislikes}
                      </div>
                      <div
                        className="cursor-pointer p-2 text-red-500"
                        onClick={changeFavorite}
                      >
                        {isFavorited ? <IoMdHeart /> : <IoMdHeartEmpty />}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap">
          {sessionUser && sessionUser.id === build.authorId && (
            <button
              className="mb-0 w-full md:w-48"
              onClick={() => setShowBuildForm(true)}
            >
              Edit Build
            </button>
          )}
          {isAuthorized && <BuildModMenu buildId={build.id} />}
          <button
            onClick={() => {
              copyToClipboard(`${window.location.origin}/builds/${build.id}`);
              setIsCopyBuildToastOpen(true);
            }}
            className="tertiary mb-0 flex items-center justify-center gap-4 md:w-48"
          >
            <FaLink /> Copy Build URL
          </button>
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

const BuildInfo = ({ build }: Omit<PageProps, "sessionUser">) => {
  return (
    <section className="p-4 md:p-0">
      <Heading>Build Information</Heading>
      <Panel className="lg:p-8">
        <div className="build-info flex flex-col gap-4 md:flex-row">
          <div className="basis-full">
            <label>Description</label>
            <p>{build.description || ""}</p>
          </div>
          <div className="basis-full md:basis-auto">
            <div className="mb-8 text-left md:flex md:flex-col md:items-center md:justify-center md:text-center">
              <label>{build.weapon.category}</label>
              <div className="mb-4 md:text-2xl">{build.weapon.name}</div>
              <Image
                src="/images/kastov-762.webp"
                width={300}
                height={300}
                alt="weapon"
              />
            </div>
            <div className="flex w-full flex-col justify-center gap-8 md:items-center">
              {build.attachmentSetups.map((attachmentSetup, index) => {
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[3rem,7rem,5rem]  items-center gap-2 md:grid-cols-[3rem,10rem,5rem,5rem]"
                  >
                    <div
                      className="h-10 w-10 bg-orange-600"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
                      }}
                    ></div>
                    <div className="flex max-w-sm flex-col">
                      <label>{attachmentSetup.attachment.category}</label>
                      <div>{attachmentSetup.attachment.name}</div>
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                      <FaArrowsAltH />
                      {parseFloat(attachmentSetup.horizontal).toFixed(2)}
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                      <FaArrowsAltV />
                      {parseFloat(attachmentSetup.vertical).toFixed(2)}
                    </div>
                    <div className="flex flex-col items-center gap-2 md:hidden">
                      <div className="flex items-center gap-2">
                        <FaArrowsAltH />
                        {parseFloat(attachmentSetup.horizontal).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaArrowsAltV />
                        {parseFloat(attachmentSetup.vertical).toFixed(2)}
                      </div>
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

const BuildReviews = (
  props: PageProps & { existingReview: ReviewFromBuildGetOneResult | null }
) => {
  const { build, sessionUser, existingReview } = props;

  const [showReviewForm, setShowReviewForm] = useState(
    existingReview ? false : true
  );

  return (
    <section className="p-4 md:p-0">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:justify-between">
          <Heading>Reviews</Heading>
          {!sessionUser && (
            <Link href="/signin">
              <button className="mb-0 w-full md:w-fit">
                Sign in to review this build!
              </button>
            </Link>
          )}
        </div>
        {sessionUser && build.authorId !== sessionUser.id && showReviewForm && (
          <Panel>
            <ReviewForm
              build={build}
              setShowReviewForm={setShowReviewForm}
              existingReview={existingReview}
              sessionUser={sessionUser}
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
              sessionUser={sessionUser}
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

  const trpcContext = await createContextServerSideProps(ctx);

  const caller = appRouter.createCaller(trpcContext);

  const build = await caller.build.getOne({ id: ctx.params.buildId });

  if (!build) {
    return {
      notFound: true,
    };
  }

  const session = await getServerAuthSession(ctx);

  const sessionUser = session?.user || null;

  return {
    props: {
      build,
      sessionUser,
    },
  };
};

export default BuildPage;
