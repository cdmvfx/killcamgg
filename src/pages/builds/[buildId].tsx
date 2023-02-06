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
import { FaArrowsAltH, FaArrowsAltV, FaEdit, FaLink } from "react-icons/fa";
import { copyToClipboard } from "../../utils/copyToClipboard";
import Toast from "../../components/ui/Toast";
import type { ReviewFromBuildGetOneResult } from "../../types/Reviews";
import { appRouter } from "../../server/trpc/router/_app";
import { createContextServerSideProps } from "../../server/trpc/context";
import { ReviewForm } from "../../components/features/reviews/ReviewForm";
import PopperButton from "../../components/ui/PopperButton";
import BuildSetup from "../../components/features/build/BuildSetup";
import Button from "../../components/ui/Button";

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const BuildPage: NextPage<PageProps> = (props) => {
  const { build: initialBuildData, sessionUser } = props;

  const [showBuildForm, setShowBuildForm] = useState(false);

  const [isCopyBuildToastOpen, setIsCopyBuildToastOpen] = useState(false);

  const utils = trpc.useContext();

  const { data: build } = trpc.build.getOne.useQuery(
    { id: initialBuildData.id },
    {
      initialData: initialBuildData,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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
        utils.build.getOne.invalidate({ id: build.id });
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
}: PageProps & {
  isFavorited: boolean;
  changeFavorite: () => void;
  averageRating: number;
  showBuildForm: boolean;
  setShowBuildForm: Dispatch<SetStateAction<boolean>>;
  isLiked: boolean | null;
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
      utils.build.getOne.invalidate({ id: build.id });
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

  let numLikes = 0;
  let numDislikes = 0;

  for (const review of build.reviews) {
    if (review.isLike === true) {
      numLikes++;
    } else if (review.isLike === false) {
      numDislikes++;
    }
  }

  return (
    <section className="flex w-full flex-col justify-between bg-black bg-opacity-50 md:flex-row md:rounded-lg">
      <div className="flex w-full flex-col justify-center gap-4 p-4 md:p-8">
        <div className="flex flex-col justify-between gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[10rem,auto] md:gap-8">
            <div className="flex items-center gap-4 text-center md:block">
              <div className="flex items-center text-4xl md:text-6xl">
                <span className="text-orange-500">
                  <IoMdStar />
                </span>{" "}
                {averageRating.toFixed(1) || "0.0"}
              </div>
              <div>
                {build.reviews.length}{" "}
                {build.reviews.length === 1 ? "Review" : "Reviews"}
              </div>
            </div>
            <div className="w-full">
              <h1 className="mb-4">
                {build.title} {build.title}
              </h1>
              <div className="flex w-full flex-wrap justify-between gap-4 md:gap-x-0">
                <div className="flex flex-wrap items-center gap-4 md:gap-x-8 md:gap-y-4">
                  <div className="w-fit">
                    <UserAvatar user={build.author} showAvatar={true} />
                  </div>
                  <div>
                    <label>
                      Created
                      <br />
                      {new Date(build.createdAt).toLocaleDateString()}
                    </label>
                  </div>
                  <div>
                    <label>
                      Last Updated
                      <br />
                      {new Date(build.updatedAt).toLocaleDateString()}
                    </label>
                  </div>
                  <PopperButton
                    showOn="hover"
                    button={<FaLink />}
                    buttonClass="hover:text-orange-500"
                    tooltip="Copy Build URL"
                    onClick={() => {
                      copyToClipboard(
                        `${window.location.origin}/builds/${build.id}`
                      );
                      setIsCopyBuildToastOpen(true);
                    }}
                  />
                  {sessionUser && sessionUser.id === build.authorId && (
                    <PopperButton
                      showOn="hover"
                      button={<FaEdit />}
                      buttonClass="hover:text-orange-500"
                      tooltip="Edit Your Build"
                      onClick={() => setShowBuildForm(true)}
                    />
                  )}
                  {isAuthorized && (
                    <BuildModMenu status={build.status} buildId={build.id} />
                  )}
                </div>
                {(!sessionUser || build.authorId !== sessionUser.id) && (
                  <div className="flex cursor-pointer items-center justify-end gap-8 text-3xl text-orange-400 md:gap-8">
                    <div
                      className="flex items-center gap-2 text-emerald-500"
                      onClick={() => handleToggleLike(true)}
                    >
                      {isLiked === true ? <MdThumbUp /> : <MdThumbUpOffAlt />}{" "}
                      {numLikes}
                    </div>
                    <div
                      className="flex items-center gap-2 text-red-500"
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
                      className="cursor-pointer text-red-500"
                      onClick={changeFavorite}
                    >
                      {isFavorited ? <IoMdHeart /> : <IoMdHeartEmpty />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BuildInfo = ({ build }: Omit<PageProps, "sessionUser">) => {
  return (
    <section className="p-4 md:p-0">
      <Heading>Build Guide</Heading>
      <div className="relative flex flex-col-reverse gap-4 md:flex-row">
        <Panel className="basis-2/3 lg:p-8">
          <div className="build-info flex flex-col gap-4 md:flex-row">
            <div className="basis-full">
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                odio ante, finibus nec interdum nec, feugiat eu eros. Aenean sed
                odio fringilla, hendrerit ante id, semper ante. Suspendisse
                iaculis pellentesque massa, et laoreet ligula congue sit amet.
                Donec sed ligula commodo, pulvinar nisi vitae, pulvinar turpis.
                In vehicula ante ac ligula malesuada semper. Etiam at lobortis
                sem. Vestibulum accumsan viverra fringilla. Quisque suscipit,
                nibh non imperdiet faucibus, nibh dui consequat neque, a
                hendrerit tellus tortor id augue. Ut placerat aliquam urna.
              </p>
              <p className="mb-4">
                Proin in est rutrum, condimentum enim at, cursus quam. Nunc eu
                augue augue. Phasellus ut sem et ex convallis hendrerit et
                scelerisque leo. Ut quam nibh, placerat eu congue quis, viverra
                vel turpis. Nulla eu hendrerit nisl. Mauris nec nisl fringilla,
                accumsan lacus ac, cursus enim. Nunc nisl nisl, bibendum at
                dolor eget, dapibus iaculis tellus. Nam fermentum erat vitae
                mauris volutpat, eu lacinia odio euismod. Proin eget sagittis
                purus. Vivamus auctor ipsum at neque commodo, a facilisis tellus
                porttitor. Sed dui lorem, venenatis volutpat consequat in,
                venenatis vel velit. Aenean porta rhoncus semper.{" "}
              </p>
              <p className="mb-4">
                Duis posuere vel orci vitae tincidunt. Etiam placerat, nibh
                bibendum imperdiet hendrerit, purus quam molestie orci, sit amet
                tincidunt risus erat ac lorem. Quisque convallis est ante, non
                vulputate quam venenatis eget. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed rutrum elit eu neque porta, eu
                fringilla tellus lacinia. Mauris diam massa, porttitor sit amet
                libero vel, egestas posuere ex. Aenean at rhoncus mauris, vitae
                sodales enim. Sed finibus fermentum nisl. Aenean nunc sapien,
                hendrerit nec libero et, vehicula feugiat metus. Aliquam erat
                volutpat. Mauris tempor enim ut vulputate suscipit. Nulla id leo
                venenatis, vehicula ante vel, volutpat odio. Phasellus vel
                ornare urna. Curabitur ullamcorper nulla at orci gravida,
                volutpat rutrum augue viverra.
              </p>
              <p>
                Aliquam lacus elit, gravida et tellus at, scelerisque pharetra
                tellus. Vestibulum id justo egestas augue pulvinar sollicitudin.
                Donec mollis ullamcorper massa eget hendrerit. Proin porta id ex
                ut rutrum.
              </p>
              <p>{build.description || ""}</p>
            </div>
          </div>
        </Panel>
        <Panel className="basis-1/3 md:sticky md:top-4">
          <BuildSetup build={build} />
        </Panel>
      </div>
    </section>
  );
};

const BuildReviews = (
  props: PageProps & {
    existingReview: ReviewFromBuildGetOneResult | null;
  }
) => {
  const { build, sessionUser, existingReview } = props;

  const [showReviewForm, setShowReviewForm] = useState(
    existingReview && existingReview.content && !existingReview.deletedAt
      ? false
      : true
  );

  const validReviews = build.reviews.filter(
    (review) => review.content !== null && !review.deletedAt
  );

  return (
    <section className="p-4 md:p-0">
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row md:justify-between">
          <Heading>Reviews</Heading>
          {!sessionUser && (
            <Link href="/signin">
              <Button
                text="Sign in to review this build!"
                classNames="p-0 mb-0 border-0"
                variant="primary"
              />
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
        {!validReviews.length ? (
          <Panel>
            <div className="text-center">No reviews yet!</div>
          </Panel>
        ) : (
          <Panel>
            <ReviewList
              sessionUser={sessionUser}
              reviews={validReviews}
              buildId={build.id}
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
