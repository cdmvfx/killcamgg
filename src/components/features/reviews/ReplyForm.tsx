import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import { z } from "zod";
import Button from "../../ui/Button";
import { TRPCClientError } from "@trpc/client";
import { replyFormSchema } from "../../../lib/formSchemas";
import toast from "react-hot-toast";

type ReplyFormProps = {
  authorName: string;
  reviewId: string;
  replyId?: string;
  setIsReplyFormOpen: Dispatch<SetStateAction<boolean>>;
  buildId: string;
};

const ReplyForm = (props: ReplyFormProps) => {
  const { authorName, reviewId, replyId, buildId, setIsReplyFormOpen } = props;

  const [content, setContent] = useState("");

  const utils = trpc.useContext();

  const { mutate } = trpc.reply.post.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: buildId });
      setContent("");
      setIsReplyFormOpen(false);
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
    },
  });

  const sendReply = () => {
    try {
      replyFormSchema.parse({ content });
      mutate({ content, reviewId, replyId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.message);
      }
    }
  };

  const closeReplyForm = () => {
    setContent("");
    setIsReplyFormOpen(false);
  };

  return (
    <div className="mb-4 flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <label>Reply to {authorName}</label>
      <input
        type="text"
        value={content}
        className="w-full"
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="gap-4 md:flex">
        <Button
          text="Send"
          classNames="p-0 mb-0 border-0"
          variant="primary"
          width="full"
          onClick={sendReply}
        />
        <Button
          text="Cancel"
          classNames="p-0 mb-0 hover:text-orange-500"
          variant="tertiary"
          width="full"
          onClick={closeReplyForm}
        />
      </div>
    </div>
  );
};

export default ReplyForm;
