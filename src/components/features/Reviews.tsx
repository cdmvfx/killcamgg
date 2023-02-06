import Link from "next/link";
import { MdThumbUpOffAlt, MdThumbDown, MdThumbUp } from "react-icons/md";
import Panel from "../ui/Panel";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import type {
  ReplyFromBuildGetOneResult,
  ReviewFromBuildGetOneResult,
} from "../../types/Reviews";
import Image from "next/image";
import type { Session } from "next-auth";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { z } from "zod";
import { Dialog, Transition } from "@headlessui/react";
import Alert from "../ui/Alert";
import Spinner from "../ui/Spinner";
import Toast from "../ui/Toast";
import type { ReviewFromUserGetProfileDataResult } from "../../types/Users";
import Button from "../ui/Button";

type ReviewGridProps = {
  reviews: ReviewFromUserGetProfileDataResult[];
};

export const ReviewGrid = (props: ReviewGridProps) => {
  const { reviews } = props;

  return (
    <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => {
        return (
          <Panel key={`review-${review.id}`}>
            <ReviewGridItem review={review} />
          </Panel>
        );
      })}
    </div>
  );
};

type ReviewGridItemProps = {
  review: ReviewFromUserGetProfileDataResult;
};

const ReviewGridItem = (props: ReviewGridItemProps) => {
  const { review } = props;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Link
          className="text-orange-500 transition-all hover:text-orange-400"
          href={`/builds/${review.buildId}`}
        >
          {review.build.title}
        </Link>
      </div>
      <div>
        {review.isLike === true && <MdThumbUp className="text-emerald-500" />}
        {review.isLike === false && <MdThumbDown className="text-red-500" />}
        {review.updatedAt.getTime() > review.createdAt.getTime()
          ? review.updatedAt.toISOString().slice(0, 10)
          : review.createdAt.toISOString().slice(0, 10)}
      </div>
      <div>{review.content}</div>
    </div>
  );
};

type ReviewListProps = {
  reviews: ReviewFromBuildGetOneResult[];
  setShowReviewForm?: (show: boolean) => void;
  sessionUser: NonNullable<Session["user"]> | null;
  buildId: string;
};

export const ReviewList = (props: ReviewListProps) => {
  const { reviews, buildId, setShowReviewForm, sessionUser } = props;

  const utils = trpc.useContext();

  const { mutate: reviewLikeMutation } = trpc.review.like.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: buildId });
    },
  });

  const { mutate: replyLikeMutation } = trpc.reply.like.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: buildId });
    },
  });

  const handleClickLikeReview = (
    reviewId: string,
    reviewAuthorId: string,
    status: boolean
  ) => {
    if (!sessionUser) return;
    if (sessionUser.id === reviewAuthorId) return;
    reviewLikeMutation({
      reviewId,
      status,
    });
  };

  const handleClickLikeReply = (
    replyId: string,
    replyAuthorId: string,
    status: boolean
  ) => {
    if (!sessionUser) return;
    if (sessionUser.id === replyAuthorId) return;
    replyLikeMutation({
      replyId,
      status,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {reviews.map((review) => {
        return (
          <ReviewItem
            key={`review-${review.id}`}
            review={review}
            buildId={buildId}
            sessionUser={sessionUser}
            setShowReviewForm={setShowReviewForm}
            handleClickLikeReview={handleClickLikeReview}
            handleClickLikeReply={handleClickLikeReply}
          />
        );
      })}
    </div>
  );
};

type ReviewItemProps = {
  buildId: string;
  review: ReviewFromBuildGetOneResult;
  setShowReviewForm?: (show: boolean) => void;
  sessionUser: NonNullable<Session["user"]> | null;
  handleClickLikeReview: (
    reviewId: string,
    reviewAuthorId: string,
    status: boolean
  ) => void;
  handleClickLikeReply: (
    replyId: string,
    replyAuthorId: string,
    status: boolean
  ) => void;
};

export const ReviewItem = (props: ReviewItemProps) => {
  const {
    review,
    setShowReviewForm,
    buildId,
    sessionUser,
    handleClickLikeReply,
    handleClickLikeReview,
  } = props;

  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);

  const [repliesToShow, setRepliesToShow] = useState(2);

  const showMoreReplies = () => {
    setRepliesToShow((prev) => {
      if (prev + 2 > review.replies.length) return review.replies.length;
      return prev + 2;
    });
  };

  const handleClickEdit = () => {
    if (!setShowReviewForm) return;
    setShowReviewForm(true);
  };

  const isLiked = sessionUser
    ? review.likes.some((likedReview) => likedReview.id === sessionUser.id)
    : false;

  return (
    <div className="border-b border-neutral-500 pb-4 last:border-b-0 last:pb-0">
      {/* {false && (
        <div className="mb-2 text-orange-500">
          <Link href={`/builds/${build.id}`}>{build.title}</Link>
        </div>
      )} */}
      <div className="flex gap-4">
        <div className="min-w-[30px]">
          <Link href={`/${review.author.name}`} className="relative">
            <Image
              src={review.author.image as string}
              className="rounded-full"
              width={30}
              height={30}
              alt={`${review.author.name} Profile Image`}
            />
            {review.isLike !== null && (
              <div className="absolute -bottom-[5px] -right-[5px] rounded-full bg-white p-[2px] text-xs">
                {review.isLike ? (
                  <MdThumbUp className="text-emerald-500" />
                ) : (
                  <MdThumbDown className="text-red-500" />
                )}
              </div>
            )}
          </Link>
        </div>
        <div>
          <Link
            href={`/${review.author.name}`}
            className="font-bold text-neutral-400"
          >
            {review.author.name}
          </Link>
          <div className="mb-2">{review.content}</div>
          <div className="mb-4 flex items-center gap-4 text-xs">
            <div
              onClick={() =>
                handleClickLikeReview(review.id, review.author.id, !isLiked)
              }
              className={`flex items-center gap-2 transition-all ${
                sessionUser && sessionUser.id !== review.author.id
                  ? "cursor-pointer hover:text-orange-500"
                  : ""
              }`}
            >
              {sessionUser && isLiked ? (
                <MdThumbUp className="text-emerald-500" />
              ) : (
                <MdThumbUpOffAlt className="text-emerald-500" />
              )}
              {review.likes.length > 0 && review.likes.length}
            </div>
            <div>{review.createdAt.toISOString().split("T")[0]}</div>
            {review.authorId === sessionUser?.id && (
              <Button
                text="Edit"
                classNames="p-0 mb-0 hover:text-orange-500"
                variant="plain"
                onClick={handleClickEdit}
              />
            )}
            <Button
              text="Reply"
              classNames="p-0 mb-0 hover:text-orange-500"
              variant="plain"
              onClick={() => setIsReplyFormOpen((prev) => !prev)}
            />
          </div>
          {isReplyFormOpen && (
            <ReplyForm
              setIsReplyFormOpen={setIsReplyFormOpen}
              authorName={review.author.name as string}
              reviewId={review.id}
              buildId={buildId}
            />
          )}
          {[...Array(repliesToShow).keys()].map((index) => (
            <ReplyItem
              key={`review-${review.id}-reply-${index}`}
              reviewId={review.id}
              reviewAuthorName={review.author.name as string}
              reply={review.replies[index] as ReplyFromBuildGetOneResult}
              sessionUser={sessionUser}
              index={index}
              buildId={buildId}
              handleClickLikeReply={handleClickLikeReply}
            />
          ))}
          {repliesToShow >= review.replies.length ? null : (
            <span
              className="cursor-pointer transition-all hover:text-orange-500"
              onClick={showMoreReplies}
            >
              Show more replies
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ReplyItem = ({
  reviewId,
  reply,
  index,
  sessionUser,
  buildId,
  handleClickLikeReply,
}: {
  reviewId: string;
  reviewAuthorName: string;
  reply: ReplyFromBuildGetOneResult;
  index: number;
  sessionUser: NonNullable<Session["user"]> | null;
  buildId: string;
  handleClickLikeReply: (
    replyId: string,
    replyAuthorId: string,
    status: boolean
  ) => void;
}) => {
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);

  if (!reply || reply.deletedAt) return <></>;

  const isLiked = sessionUser
    ? reply.likes.some((like) => {
        if (!sessionUser) return false;
        return like.id === sessionUser.id;
      })
    : false;

  return (
    <div key={`review-${reviewId}-reply-${index}`}>
      <div className="flex gap-2">
        <div>
          <Link href={`/${reply.author.name}`} className="relative">
            <Image
              src={
                reply.deletedAt
                  ? "/favicon.ico"
                  : (reply.author.image as string)
              }
              className="mt-1 rounded-full"
              width={20}
              height={20}
              alt={`${reply.author.name} Profile Image`}
            />
          </Link>
        </div>
        <div>
          <Link
            href={`/${reply.author.name}`}
            className="font-bold text-neutral-400 transition-all hover:text-orange-500"
          >
            {reply.author.name}
          </Link>
          {reply.reply && (
            <div className="mb-1 text-xs">
              Replying to{" "}
              <Link
                className="text-neutral-400 transition-all hover:text-orange-500"
                href={`/${reply.reply.author.name as string}`}
              >
                {reply.reply.author.name}
              </Link>
            </div>
          )}
          <div className="mb-2">{reply.content}</div>
          <div className="mb-4 flex items-center gap-4 text-xs">
            <div
              onClick={() => {
                handleClickLikeReply(reply.id, reply.author.id, !isLiked);
              }}
              className={`flex items-center gap-2 transition-all ${
                sessionUser && sessionUser.id !== reply.author.id
                  ? "cursor-pointer hover:text-orange-500"
                  : ""
              }`}
            >
              {sessionUser && isLiked ? (
                <MdThumbUp className="text-emerald-500" />
              ) : (
                <MdThumbUpOffAlt className="text-emerald-500" />
              )}
              {reply.likes.length > 0 && reply.likes.length}
            </div>
            <div>{reply.createdAt.toISOString().split("T")[0]}</div>
            {sessionUser?.id === reply.author.id && (
              <DeleteReply replyId={reply.id} buildId={buildId} />
            )}
            <Button
              text="Reply"
              classNames="p-0 mb-0 hover:text-orange-500"
              variant="plain"
              onClick={() => setIsReplyFormOpen((prev) => !prev)}
            />
          </div>
        </div>
      </div>
      {isReplyFormOpen && (
        <ReplyForm
          setIsReplyFormOpen={setIsReplyFormOpen}
          authorName={reply.author.name as string}
          reviewId={reviewId}
          replyId={reply.id}
          buildId={buildId}
        />
      )}
    </div>
  );
};

type ReplyFormProps = {
  authorName: string;
  reviewId: string;
  replyId?: string;
  setIsReplyFormOpen: Dispatch<SetStateAction<boolean>>;
  buildId: string;
};

const ReplyForm = (props: ReplyFormProps) => {
  const { authorName, reviewId, replyId, buildId, setIsReplyFormOpen } = props;

  const [content, setContent] = useState("");

  const [showError, setShowError] = useState(false);

  const utils = trpc.useContext();

  const { mutate } = trpc.reply.post.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: buildId });
      setContent("");
      setIsReplyFormOpen(false);
    },
  });

  const sendReply = () => {
    const replySchema = z.object({
      content: z
        .string()
        .min(10, {
          message: "Reply must be more than 10 characters.",
        })
        .max(100, { message: "Reply must be less than 100 characters." }),
    });

    try {
      replySchema.parse({ content });
      mutate({ content, reviewId, replyId });
    } catch (e) {
      setShowError(true);
    }
  };

  const closeReplyForm = () => {
    setContent("");
    setIsReplyFormOpen(false);
  };

  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <Toast
        isVisible={showError}
        setIsVisible={setShowError}
        message="Reply must be less than 100 characters."
        status="error"
      />
      <label>Reply to {authorName}</label>
      <input
        type="text"
        value={content}
        className="w-full"
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="gap-4 md:flex">
        <Button
          text="Send"
          classNames="p-0 mb-0 border-0"
          variant="primary"
          onClick={sendReply}
        />
        <Button
          text="Cancel"
          classNames="p-0 mb-0 hover:text-orange-500"
          variant="plain"
          onClick={closeReplyForm}
        />
      </div>
    </div>
  );
};

const DeleteReply = (props: { replyId: string; buildId: string }) => {
  const { replyId, buildId } = props;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const utils = trpc.useContext();

  const { mutate, isLoading } = trpc.reply.delete.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: buildId });
    },
  });

  const deleteReply = () => {
    mutate({ replyId });
    setShowDeleteModal(false);
  };

  return (
    <>
      <Button
        text="Delete"
        classNames="p-0 mb-0 hover:text-orange-500"
        variant="plain"
        onClick={() => setShowDeleteModal(true)}
      />
      <Transition appear show={showDeleteModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowDeleteModal(false)}
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

          <div className="fixed inset-0 flex items-center justify-center overflow-y-auto">
            <div className="flex items-center justify-center md:p-4">
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
                  <div>
                    <div className="mb-4">
                      <Alert
                        status="error"
                        message="Are you sure you want to delete your reply? This action cannot be undone."
                      />
                    </div>
                    {isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        <Button
                          text="Delete"
                          classNames="mb-2"
                          variant="primary"
                          onClick={deleteReply}
                          width="full"
                        />
                        <Button
                          text="Cancel"
                          classNames=""
                          variant="secondary"
                          width="full"
                          onClick={() => setShowDeleteModal(false)}
                        />
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ReviewList;
