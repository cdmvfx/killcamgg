import Link from "next/link";
import { MdThumbUpOffAlt, MdThumbDown, MdThumbUp } from "react-icons/md";
import type {
  ReplyFromBuildGetOneResult,
  ReviewFromBuildGetOneResult,
} from "../../../types/Reviews";
import Image from "next/image";
import type { Session } from "next-auth";
import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import Button from "../../ui/Button";
import ReplyForm from "./ReplyForm";
import ReplyItem from "./ReplyItem";
import ReviewModMenu from "../moderation/ReviewModMenu";

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
            {review.author.displayName}
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
            {sessionUser &&
              (sessionUser.role === "ADMIN" ||
                sessionUser.role === "MODERATOR") && (
                <ReviewModMenu buildId={buildId} reviewId={review.id} />
              )}
          </div>
          {isReplyFormOpen && (
            <ReplyForm
              setIsReplyFormOpen={setIsReplyFormOpen}
              authorName={review.author.displayName}
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

export default ReviewList;
