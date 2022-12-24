import type { Attachment, Build, Review, Weapon } from "@prisma/client";
import Link from "next/link";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import UserAvatar from "../ui/UserAvatar";
import { useState } from "react";
import Alert from "../ui/Alert";

type BuildWithReviewsAndAuthor = Build & {
  weapon: Weapon;
  reviews: (Review & {
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  })[];
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  attachments: Attachment[];
};

type ReviewWithAuthorAndBuild = Review & {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  build?: Build;
};

type ReviewCardProps = {
  build?: BuildWithReviewsAndAuthor;
  review: ReviewWithAuthorAndBuild;
};

export const ReviewCard = (props: ReviewCardProps) => {
  const { build, review } = props;

  return (
    <div className="border-b border-neutral-500 pb-4 last:border-b-0 last:pb-0">
      {review.build && (
        <div className="mb-2 text-orange-500">
          <Link href={`/builds/${review.build.id}`}>
            {build && review.build ? build.title : review.build?.title}
          </Link>
        </div>
      )}
      {review.author && (
        <div className="mb-2">
          <UserAvatar user={review.author} showAvatar={true} />
        </div>
      )}
      <div className="mb-2">
        <div className="mb-2 flex items-center gap-4">
          <span className="flex text-orange-500">
            {[1, 2, 3, 4, 5].map((number) => {
              if (number <= (review.rating as number)) {
                return (
                  <IoMdStar key={`review-${review.id}-rating-star-${number}`} />
                );
              }
              return (
                <IoMdStarOutline
                  key={`review-${review.id}-rating-star-${number}`}
                />
              );
            })}
          </span>
          {new Date(review.createdAt).toDateString()}
        </div>
        <div>{review.content}</div>
      </div>
    </div>
  );
};

type ReviewListProps = {
  build?: BuildWithReviewsAndAuthor;
  reviews: ReviewWithAuthorAndBuild[];
};

export const ReviewList = (props: ReviewListProps) => {
  const { reviews, build } = props;

  return (
    <div className="flex flex-col gap-8">
      {reviews.map((review) => {
        return (
          <ReviewCard
            key={`review-${review.id}`}
            review={review}
            build={build}
          />
        );
      })}
    </div>
  );
};

type ReviewFormProps = {
  build: Build;
  setShowReviewForm: (show: boolean) => void;
};

export const ReviewForm = (props: ReviewFormProps) => {
  const { setShowReviewForm, build } = props;

  type FormErrors = {
    rating: string[];
    content: string[];
  };

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    rating: [],
    content: [],
  });

  const utils = trpc.useContext();

  const postReview = trpc.review.postReview.useMutation({
    onSuccess: () => {
      setShowReviewForm(false);
      utils.build.getOne.invalidate({ id: build.id });
    },
  });

  const submitReview = () => {
    const reviewSchema = z.object({
      rating: z
        .number()
        .min(1, {
          message: "Rating must be at least 1",
        })
        .max(5, {
          message: "Rating must be at most 5",
        }),
      content: z
        .string()
        .min(30, {
          message: "Review must be at least 30 characters long",
        })
        .max(500, {
          message: "Review must be at most 500 characters long",
        }),
    });

    try {
      reviewSchema.parse({ rating, content });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors as FormErrors);
      }
      return;
    }

    postReview.mutate({
      buildId: build.id,
      rating,
      content,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="rating">Rating</label>
        <div className="flex gap-0 text-2xl text-orange-400">
          {[1, 2, 3, 4, 5].map((number) => {
            if (number <= rating) {
              return (
                <IoMdStar
                  key={`rating-input-${number}`}
                  onClick={() => setRating(number)}
                  className="cursor-pointer"
                />
              );
            }
            return (
              <IoMdStarOutline
                key={`rating-input-${number}`}
                onClick={() => setRating(number)}
                className="cursor-pointer"
              />
            );
          })}
        </div>
        {errors.rating &&
          errors.rating.map((error, index) => (
            <Alert
              key={`rating-error-${index}`}
              status="error"
              message={error}
            />
          ))}
      </div>
      <div>
        <label htmlFor="review">Review</label>
        <textarea
          name="review"
          id="review"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {errors.content &&
          errors.content.map((error, index) => (
            <Alert
              key={`review-error-${index}`}
              status="error"
              message={error}
            />
          ))}
      </div>
      <div>
        <button className="w-full" onClick={submitReview}>
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default ReviewList;
