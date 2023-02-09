import Link from "next/link";
import { MdThumbDown, MdThumbUp } from "react-icons/md";
import Panel from "../../ui/Panel";
import type { ReviewFromUserGetProfileDataResult } from "../../../types/Users";

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

export default ReviewGrid;
