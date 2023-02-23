import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MdThumbUp, MdThumbUpOffAlt } from "react-icons/md";
import type { ReplyFromBuildGetOneResult } from "../../../types/Reviews";
import Button from "../../ui/Button";
import ReplyForm from "./ReplyForm";
import type { Session } from "next-auth";
import Alert from "../../ui/Alert";
import Spinner from "../../ui/Spinner";
import ModalButton from "../../ui/ModalButton";
import { trpc } from "../../../utils/trpc";
import ReplyModMenu from "../moderation/ReplyModMenu";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

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
  const router = useRouter();

  if (!reply) return <></>;

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
              src={reply.author.image}
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
            {reply.author.displayName}
          </Link>
          {reply.reply && (
            <div className="mb-1 text-xs">
              Replying to{" "}
              <Link
                className="text-neutral-400 transition-all hover:text-orange-500"
                href={`/${reply.reply.author.name}`}
              >
                {reply.reply.author.displayName}
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
              onClick={() => {
                if (sessionUser) {
                  return setIsReplyFormOpen((prev) => !prev);
                }
                return router.push("/auth/signin");
              }}
            />
            {sessionUser && <ReportReply replyId={reply.id} />}
            {sessionUser &&
              (sessionUser.role === "ADMIN" ||
                sessionUser.role === "MODERATOR") && (
                <ReplyModMenu buildId={buildId} replyId={reply.id} />
              )}
          </div>
        </div>
      </div>
      {isReplyFormOpen && (
        <ReplyForm
          setIsReplyFormOpen={setIsReplyFormOpen}
          authorName={reply.author.displayName}
          reviewId={reviewId}
          replyId={reply.id}
          buildId={buildId}
        />
      )}
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
    <ModalButton
      show={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      openButton={
        <Button
          text="Delete"
          classNames="p-0 mb-0 hover:text-orange-500"
          variant="plain"
          onClick={() => setShowDeleteModal(true)}
        />
      }
    >
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
    </ModalButton>
  );
};

const ReportReply = (props: { replyId: string }) => {
  const { replyId } = props;

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate, isLoading } = trpc.reply.report.useMutation({
    onSuccess: () => {
      toast.success("Comment reported.");
      setReason("");
      setShowModal(false);
    },
    onError: () => {
      toast.error("Failed to report comment.");
    },
  });

  const handleReport = () => {
    mutate({ replyId, reason });
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
            <p>Please explain why you are reporting this comment.</p>
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

export default ReplyItem;
