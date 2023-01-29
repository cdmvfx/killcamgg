import Link from "next/link";
import { MdThumbUpOffAlt, MdThumbDown, MdThumbUp } from "react-icons/md";
import Panel from "../ui/Panel";

import type { BuildWithReviewsAndAuthor } from "../../types/Builds";
import type {
  ReplyFromBuildGetOneResult,
  ReviewFromBuildGetOneResult,
} from "../../types/Reviews";
import Image from "next/image";
import type { UserGetOneResult } from "../../types/Users";
import type { Session } from "next-auth";

type ReviewGridProps = {
  reviews: ReviewFromBuildGetOneResult[];
  sessionUser: NonNullable<Session["user"]> | null;
};

export const ReviewGrid = (props: ReviewGridProps) => {
  const { reviews, sessionUser } = props;

  return (
    <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => {
        return (
          <Panel key={`review-${review.id}`}>
            <ReviewItem review={review} sessionUser={sessionUser} />
          </Panel>
        );
      })}
    </div>
  );
};

type ReviewListProps = {
  build?: BuildWithReviewsAndAuthor;
  reviews: ReviewFromBuildGetOneResult[];
  setShowReviewForm?: (show: boolean) => void;
  sessionUser: NonNullable<Session["user"]> | null;
};

export const ReviewList = (props: ReviewListProps) => {
  const { reviews, build, setShowReviewForm, sessionUser } = props;

  return (
    <div className="flex flex-col gap-8">
      {reviews.map((review) => {
        return (
          <ReviewItem
            key={`review-${review.id}`}
            review={review}
            build={build}
            sessionUser={sessionUser}
            setShowReviewForm={setShowReviewForm}
          />
        );
      })}
    </div>
  );
};

type ReviewItemProps = {
  review: ReviewFromBuildGetOneResult;
  setShowReviewForm?: (show: boolean) => void;
  build?: BuildWithReviewsAndAuthor;
  sessionUser: NonNullable<Session["user"]> | null;
};

export const ReviewItem = (props: ReviewItemProps) => {
  const { review, setShowReviewForm, build, sessionUser } = props;

  const handleClickEdit = () => {
    if (!setShowReviewForm) return;
    setShowReviewForm(true);
  };

  const isLiked = sessionUser
    ? review.likes.some((likedReview) => likedReview.id === sessionUser.id)
    : false;

  return (
    <div className="border-b border-neutral-500 pb-4 last:border-b-0 last:pb-0">
      {build && (
        <div className="mb-2 text-orange-500">
          <Link href={`/builds/${build.id}`}>{build.title}</Link>
        </div>
      )}
      {!build && review.author && (
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
              <div className="absolute -bottom-[5px] -right-[5px] rounded-full bg-white p-[2px] text-xs">
                {review.isLike ? (
                  <MdThumbUp className="text-emerald-500" />
                ) : (
                  <MdThumbDown className="text-red-500" />
                )}
              </div>
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
              <div className="flex cursor-pointer items-center gap-2 transition-all hover:text-orange-500">
                {(sessionUser && isLiked) ||
                (sessionUser && review.author.id === sessionUser.id) ? (
                  <MdThumbUp className="text-emerald-500" />
                ) : (
                  <MdThumbUpOffAlt className="text-emerald-500" />
                )}
                {review.likes.length > 0 && review.likes.length}
              </div>
              <div>{review.createdAt.toISOString().split("T")[0]}</div>
              {review.authorId === sessionUser?.id && (
                <button
                  className="tertiary mb-0 w-fit p-0"
                  onClick={handleClickEdit}
                >
                  Edit
                </button>
              )}
              <button className="tertiary w-fit p-0">Reply</button>
            </div>
            {review.replies.map((reply, index) => (
              <ReplyItem
                key={`review-${review.id}-reply-${index}`}
                reviewId={review.id}
                reply={reply}
                sessionUser={sessionUser}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ReplyItem = ({
  reviewId,
  reply,
  index,
  sessionUser,
}: {
  reviewId: string;
  reply: ReplyFromBuildGetOneResult;
  index: number;
  sessionUser: NonNullable<Session["user"]> | null;
}) => {
  const handleClickEdit = () => {
    console.log("edit");
  };

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
              src={reply.author.image as string}
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
            className="font-bold text-neutral-400"
          >
            {reply.author.name}
          </Link>
          <div className="mb-2">{reply.content}</div>
          <div className="mb-4 flex items-center gap-4 text-xs">
            <div className="flex cursor-pointer items-center gap-2 transition-all hover:text-orange-500">
              {(sessionUser && isLiked) ||
              (sessionUser && reply.author.id === sessionUser.id) ? (
                <MdThumbUp className="text-emerald-500" />
              ) : (
                <MdThumbUpOffAlt className="text-emerald-500" />
              )}
              {reply.likes.length > 0 && reply.likes.length}
            </div>
            <div>{reply.createdAt.toISOString().split("T")[0]}</div>
            {reply.author.id === sessionUser?.id && (
              <button
                className="tertiary mb-0 w-fit p-0"
                onClick={handleClickEdit}
              >
                Edit
              </button>
            )}
            <button className="tertiary w-fit p-0">Reply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewList;
