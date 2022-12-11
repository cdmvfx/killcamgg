import type { Build } from "@prisma/client";
import Link from "next/link";
import { IoMdStar } from "react-icons/io";
import type { CompleteReviewData } from "../../types/Reviews";
import UserAvatar from "../ui/UserAvatar";

type ReviewsProps = {
  reviews: CompleteReviewData[];
};

type ReviewCardProps = {
  build?: Build;
  review: CompleteReviewData;
};

export const ReviewCard = (props: ReviewCardProps) => {
  const { build, review } = props;

  return (
    <div className="bg-neutral-800 py-4">
      {review.build && (
        <div className="mb-2 px-4 text-orange-500">
          <Link href={`/builds/${review.build.id}`}>
            {build && review.build ? build.title : review.build?.title}
          </Link>
        </div>
      )}
      {review.author && (
        <div className="mb-2 px-4">
          <UserAvatar user={review.author} showAvatar={true} />
        </div>
      )}
      <div className="mb-2 px-4">
        <div className="mb-2 flex items-center gap-4">
          <span className="flex text-orange-500">
            {Array.from(Array(review.rating).keys()).map((ratingNum) => (
              <div key={`${review.id}-star-${ratingNum}`}>
                <IoMdStar />
              </div>
            ))}
          </span>
          {new Date(review.createdAt).toDateString()}
        </div>
        <div>{review.content}</div>
      </div>
    </div>
  );
};

const Reviews = (props: ReviewsProps) => {
  const { reviews } = props;

  return (
    <div>
      {reviews.map((review) => {
        return <ReviewCard key={`review-${review.id}`} review={review} />;
      })}
    </div>
  );
};

export default Reviews;
