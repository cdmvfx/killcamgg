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
import ModalButton from "../../ui/ModalButton";
import Spinner from "../../ui/Spinner";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

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

  const router = useRouter();

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
              onClick={() => {
                if (sessionUser) {
                  return setIsReplyFormOpen((prev) => !prev);
                }
                return router.push("/auth/signin");
              }}
            />
            {sessionUser && <ReportReview reviewId={review.id} />}
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

const ReportReview = (props: { reviewId: string }) => {
  const { reviewId } = props;

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate, isLoading } = trpc.review.report.useMutation({
    onSuccess: () => {
      toast.success("Review reported.");
      setReason("");
      setShowModal(false);
    },
    onError: () => {
      toast.error("Failed to report review.");
    },
  });

  const handleReport = () => {
    mutate({ reviewId, reason });
  };

  return (
    <>
      <ModalButton
        show={showModal}
        onClose={() => setShowModal(false)}
        openButton={
          <Button
            text="Report"
            classNames="p-0 mb-0 hover:text-orange-500"
            variant="plain"
            onClick={() => setShowModal(true)}
          />
        }
      >
        <div>
          <div className="mb-4">
            <p>Please explain why you are reporting this review.</p>
            <textarea
              cols={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <Button
                text="Report"
                classNames="mb-2"
                variant="primary"
                onClick={handleReport}
                width="full"
              />
              <Button
                text="Cancel"
                classNames=""
                variant="secondary"
                width="full"
                onClick={() => setShowModal(false)}
              />
            </>
          )}
        </div>
      </ModalButton>
    </>
  );
};

export default ReviewList;
