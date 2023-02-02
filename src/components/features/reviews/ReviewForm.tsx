import type { Build } from "@prisma/client";
import { z } from "zod";
import { trpc } from "../../../utils/trpc";
import React, { useState } from "react";
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
import { Dialog, Transition } from "@headlessui/react";

type ReviewFormProps = {
  build: Build;
  setShowReviewForm: (show: boolean) => void;
  existingReview: ReviewFromBuildGetOneResult | null;
  sessionUser: NonNullable<Session["user"]>;
};

export const ReviewForm = (props: ReviewFormProps) => {
  const { setShowReviewForm, build, existingReview } = props;

  type FormErrors = {
    isLike: string[];
    content: string[];
    general?: string[];
  };

  const [isLike, setIsLike] = useState(
    existingReview && existingReview.isLike !== null
      ? existingReview.isLike
      : null
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
      setShowReviewForm(false);
      utils.build.getOne.invalidate({ id: build.id });
    },
    onError: async (error) => {
      setErrors({ isLike: [], content: [], general: [error.message] });
    },
  });

  const editReview = trpc.review.edit.useMutation({
    onSuccess: async () => {
      setShowReviewForm(false);
      utils.build.getOne.invalidate({ id: build.id });
    },
    onError: async (error) => {
      setErrors({ isLike: [], content: [], general: [error.message] });
    },
  });

  const deleteReviewMutation = trpc.review.delete.useMutation({
    onSuccess: async () => {
      setShowDeleteModal(false);
      setShowReviewForm(true);
      utils.build.getOne.invalidate({ id: build.id });
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
      isLike: z
        .boolean({
          invalid_type_error: "You must select a rating",
        })
        .nullable(),
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
      reviewSchema.parse({
        isLike,
        content,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.flatten().fieldErrors);
        setErrors(error.flatten().fieldErrors as FormErrors);
      }
      return;
    }

    const parsedContent = content.trim().length > 0 ? content.trim() : null;

    if (existingReview) {
      editReview.mutate({
        buildId: existingReview.buildId,
        isLike,
        content: parsedContent,
      });
      return;
    }

    postReview.mutate({
      buildId: build.id,
      isLike,
      content: parsedContent,
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
      <h3>
        {existingReview && !existingReview.deletedAt
          ? "Edit Your Review"
          : "Publish A Review"}
      </h3>
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
              className="mt-2"
              message={error}
            />
          ))}
      </div>
      <div>
        {postReview.isLoading || editReview.isLoading ? (
          <Spinner />
        ) : (
          <div className="flex justify-end gap-4">
            <button className="mb-0 w-fit" onClick={handleSubmitClick}>
              {existingReview ? "Publish" : "Publish"}
            </button>
            {existingReview && !existingReview.deletedAt && (
              <>
                <button
                  className="secondary mb-0 w-fit"
                  onClick={handleDeleteClick}
                >
                  Delete
                </button>
                <button className="tertiary w-fit" onClick={handleCancelClick}>
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
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
                        message="Are you sure you want to delete your review? It will be removed from the public page, but remain as a draft for you to edit and publish later."
                      />
                    </div>
                    {deleteReviewMutation.isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        <button className="w-full" onClick={handleDeleteFinal}>
                          Delete
                        </button>
                        <button
                          className="secondary w-full"
                          onClick={handleDeleteCancel}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {errors.general &&
        errors.general.map((error, index) => (
          <Alert
            key={`submission-error-${index}`}
            status="error"
            message={error}
          />
        ))}
    </div>
  );
};
