import type { Build } from "@prisma/client";
import { z } from "zod";
import { trpc } from "../../../utils/trpc";
import { useState } from "react";
import Alert from "../../ui/Alert";
import Spinner from "../../ui/Spinner";
import {
  MdThumbDownOffAlt,
  MdThumbUpOffAlt,
  MdThumbDown,
  MdThumbUp,
} from "react-icons/md";

import type { ReviewFromBuildGetOneResult } from "../../../types/Reviews";
import type { Session } from "next-auth";

type ReviewFormProps = {
  build: Build;
  setShowReviewForm: (show: boolean) => void;
  existingReview: ReviewFromBuildGetOneResult | null;
  sessionUser: NonNullable<Session["user"]>;
};

export const ReviewForm = (props: ReviewFormProps) => {
  const { setShowReviewForm, build, existingReview, sessionUser } = props;

  type FormErrors = {
    isLike: string[];
    content: string[];
    general?: string[];
  };

  const [isLike, setIsLike] = useState(
    existingReview ? existingReview.isLike : null
  );
  const [content, setContent] = useState(
    existingReview && existingReview.content ? existingReview.content : ""
  );
  const [errors, setErrors] = useState<FormErrors>({
    isLike: [],
    content: [],
    general: [],
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const utils = trpc.useContext();

  const postReview = trpc.review.post.useMutation({
    onSuccess: async () => {
      utils.build.getOne.setData({ id: build.id }, (old) => {
        if (!old) return;
        if (isLike === null) return;
        return {
          ...old,
          reviews: [
            ...old.reviews,
            {
              id: "temp",
              author: {
                id: sessionUser.id || "temp",
                name: sessionUser.name || "temp",
                image: sessionUser.image || "temp",
              },
              authorId: sessionUser.id || "temp",
              isLike: isLike,
              content: content,
              createdAt: new Date(),
              updatedAt: new Date(),
              buildId: build.id,
              likes: [],
              totalLikes: 0,
              replies: [],
              _count: {
                likes: 0,
              },
            },
          ],
        };
      });
      setShowReviewForm(false);
      utils.build.getOne.invalidate({ id: build.id });
      utils.review.getOne.invalidate({ buildId: build.id });
    },
    onError: async (error) => {
      setErrors({ isLike: [], content: [], general: [error.message] });
    },
  });

  const editReview = trpc.review.edit.useMutation({
    onSuccess: async () => {
      utils.build.getOne.setData({ id: build.id }, (old) => {
        if (!old) return;
        if (isLike === null) return;
        return {
          ...old,
          reviews: [
            ...old.reviews.filter((review) => review.id !== existingReview?.id),

            {
              id: existingReview?.id || "temp",
              author: {
                id: sessionUser.id || "temp",
                name: sessionUser.name || "temp",
                image: sessionUser.image || "temp",
              },
              authorId: existingReview?.authorId || "temp",
              isLike: isLike,
              content: content,
              likes: [],
              createdAt: existingReview?.createdAt || new Date(),
              updatedAt: new Date(),
              buildId: build.id,
              totalLikes: existingReview?.totalLikes || 0,
              replies: [],
            },
          ],
        };
      });
      setShowReviewForm(false);
      utils.build.getOne.invalidate({ id: build.id });
      utils.review.getOne.invalidate({ buildId: build.id });
    },
    onError: async (error) => {
      setErrors({ isLike: [], content: [], general: [error.message] });
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
      setIsLike(null);
      setContent("");
      utils.build.getOne.invalidate({ id: build.id });
      utils.review.getOne.invalidate({ buildId: build.id });
    },
    onError: async (error) => {
      setErrors({ isLike: [], content: [], general: [error.message] });
    },
  });

  const handleSubmitClick = () => {
    setErrors({
      isLike: [],
      content: [],
      general: [],
    });

    const reviewSchema = z.object({
      isLike: z.boolean(),
      content: z.string().max(500, {
        message: "Review must be at most 500 characters long",
      }),
    });

    try {
      reviewSchema.parse({ isLike, content });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors as FormErrors);
      }
      return;
    }

    if (isLike === null) return;

    if (existingReview) {
      editReview.mutate({
        buildId: existingReview.buildId,
        isLike,
        content,
      });
      return;
    }

    postReview.mutate({
      buildId: build.id,
      isLike,
      content,
    });
  };

  const handleCancelClick = () => {
    setShowReviewForm(false);
    setIsLike(existingReview ? existingReview.isLike : null);
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
        <div className="flex cursor-pointer text-4xl text-orange-400">
          <div className="p-2 text-emerald-500" onClick={() => setIsLike(true)}>
            {isLike === true ? <MdThumbUp /> : <MdThumbUpOffAlt />}
          </div>
          <div className="p-2 text-red-500" onClick={() => setIsLike(false)}>
            {isLike === false ? <MdThumbDown /> : <MdThumbDownOffAlt />}
          </div>
        </div>
        {errors.isLike &&
          errors.isLike.map((error, index) => (
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
