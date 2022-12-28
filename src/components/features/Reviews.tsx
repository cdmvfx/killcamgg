import type { Attachment, Build, Review, User, Weapon } from "@prisma/client";
import Link from "next/link";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import UserAvatar from "../ui/UserAvatar";
import { useState } from "react";
import Alert from "../ui/Alert";
import { useSession } from "next-auth/react";
import Spinner from "../ui/Spinner";

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
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  build?: Build;
};

type ReviewCardProps = {
  build?: BuildWithReviewsAndAuthor;
  review: ReviewWithAuthorAndBuild;
  setShowReviewForm?: (show: boolean) => void;
};

export const ReviewCard = (props: ReviewCardProps) => {
  const { build, review, setShowReviewForm } = props;

  const { data: session } = useSession();

  const handleClickEdit = () => {
    if (!setShowReviewForm) return;
    setShowReviewForm(true);
  };

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
        <div className="mb-2 flex items-center justify-between">
          <UserAvatar user={review.author} showAvatar={true} />
          {review.authorId === session?.user?.id && (
            <button className="tertiary w-fit p-0" onClick={handleClickEdit}>
              Edit
            </button>
          )}
        </div>
      )}
      <div className="">
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
        <div className="mb-2">{review.content}</div>
        <div className="text-xs italic text-neutral-500">
          {review.createdAt.toDateString() !== review.updatedAt.toDateString()
            ? `Last Edited: ${review.updatedAt.toDateString()}`
            : ""}
        </div>
      </div>
    </div>
  );
};

type ReviewListProps = {
  build?: BuildWithReviewsAndAuthor;
  reviews: ReviewWithAuthorAndBuild[];
  setShowReviewForm?: (show: boolean) => void;
};

export const ReviewList = (props: ReviewListProps) => {
  const { reviews, build, setShowReviewForm } = props;

  return (
    <div className="flex flex-col gap-8">
      {reviews.map((review) => {
        return (
          <ReviewCard
            key={`review-${review.id}`}
            review={review}
            build={build}
            setShowReviewForm={setShowReviewForm}
          />
        );
      })}
    </div>
  );
};

type ReviewFormProps = {
  build: Build;
  setShowReviewForm: (show: boolean) => void;
  existingReview?: Review;
  user:
    | (User & {
        favorites: Build[];
      })
    | null;
};

export const ReviewForm = (props: ReviewFormProps) => {
  const { setShowReviewForm, build, existingReview, user } = props;

  type FormErrors = {
    rating: string[];
    content: string[];
    general?: string[];
  };

  const [rating, setRating] = useState(
    existingReview ? existingReview.rating : 0
  );
  const [content, setContent] = useState(
    existingReview && existingReview.content ? existingReview.content : ""
  );
  const [errors, setErrors] = useState<FormErrors>({
    rating: [],
    content: [],
    general: [],
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const utils = trpc.useContext();

  const postReview = trpc.review.post.useMutation({
    onSuccess: async () => {
      utils.build.getOne.setData({ id: build.id }, (old) => {
        if (!old) return;
        return {
          ...old,
          reviews: [
            ...old.reviews,
            {
              id: "temp",
              author: {
                id: user?.id || "temp",
                name: user?.name || "temp",
                image: user?.image || "temp",
              },
              authorId: user?.id || "temp",
              rating: rating,
              content: content,
              createdAt: new Date(),
              updatedAt: new Date(),
              buildId: build.id,
            },
          ],
        };
      });
      setShowReviewForm(false);
      utils.build.getOne.invalidate({ id: build.id });
    },
    onError: async (error) => {
      setErrors({ rating: [], content: [], general: [error.message] });
    },
  });

  const editReview = trpc.review.edit.useMutation({
    onSuccess: async () => {
      utils.build.getOne.setData({ id: build.id }, (old) => {
        if (!old) return;
        return {
          ...old,
          reviews: [
            ...old.reviews.filter((review) => review.id !== existingReview?.id),

            {
              id: existingReview?.id || "temp",
              author: {
                id: user?.id || "temp",
                name: user?.name || "temp",
                image: user?.image || "temp",
              },
              authorId: existingReview?.authorId || "temp",
              rating: rating,
              content: content,
              createdAt: existingReview?.createdAt || new Date(),
              updatedAt: new Date(),
              buildId: build.id,
            },
          ],
        };
      });
      setShowReviewForm(false);
      utils.build.getOne.invalidate({ id: build.id });
    },
    onError: async (error) => {
      setErrors({ rating: [], content: [], general: [error.message] });
    },
  });

  const deleteReviewMutation = trpc.review.delete.useMutation({
    onSuccess: async () => {
      utils.build.getOne.setData({ id: build.id }, (old) => {
        if (!old) return;
        return {
          ...old,
          reviews: [
            ...old.reviews.filter((review) => review.id !== existingReview?.id),
          ],
        };
      });
      setShowDeleteModal(false);
      setShowReviewForm(true);
      setRating(0);
      setContent("");
      utils.build.getOne.invalidate({ id: build.id });
    },
    onError: async (error) => {
      setErrors({ rating: [], content: [], general: [error.message] });
    },
  });

  const handleSubmitClick = () => {
    setErrors({
      rating: [],
      content: [],
      general: [],
    });

    const reviewSchema = z.object({
      rating: z
        .number()
        .min(1, {
          message: "Rating must be at least 1",
        })
        .max(5, {
          message: "Rating must be at most 5",
        }),
      content: z.string().max(500, {
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

    if (existingReview) {
      editReview.mutate({
        buildId: existingReview.buildId,
        rating,
        content,
      });
      return;
    }

    postReview.mutate({
      buildId: build.id,
      rating,
      content,
    });
  };

  const handleCancelClick = () => {
    setShowReviewForm(false);
    setRating(existingReview ? existingReview.rating : 0);
    setContent(
      existingReview && existingReview.content ? existingReview.content : ""
    );
  };

  const handleDeleteClick = () => {
    if (!existingReview) return;
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteFinal = () => {
    if (!existingReview) return;
    deleteReviewMutation.mutate({ id: existingReview.id, buildId: build.id });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3>{existingReview ? "Edit Your Review" : "Post A Review"}</h3>
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
        <label htmlFor="review">Review (optional)</label>
        <textarea
          name="review"
          id="review"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {errors.content.map((error, index) => (
          <Alert key={`review-error-${index}`} status="error" message={error} />
        ))}
      </div>
      {!showDeleteModal && (
        <div>
          {postReview.isLoading || editReview.isLoading ? (
            <Spinner />
          ) : (
            <>
              <button className="" onClick={handleSubmitClick}>
                {existingReview ? "Save Review" : "Post Review"}
              </button>
              {existingReview && (
                <>
                  <button className="secondary" onClick={handleDeleteClick}>
                    Delete Review
                  </button>
                  <button className="tertiary" onClick={handleCancelClick}>
                    Cancel
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
      {showDeleteModal && (
        <div>
          <div className="mb-2">
            Are you sure you want to delete your review?
          </div>
          {deleteReviewMutation.isLoading ? (
            <Spinner />
          ) : (
            <>
              <button className="w-full" onClick={handleDeleteFinal}>
                Delete
              </button>
              <button
                className="secondary mt-2 w-full"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
      {errors.general?.map((error, index) => (
        <Alert
          key={`submission-error-${index}`}
          status="error"
          message={error}
        />
      ))}
    </div>
  );
};

export default ReviewList;
