import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import { z } from "zod";
import Toast from "../../ui/Toast";
import Button from "../../ui/Button";

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

  const [showError, setShowError] = useState(false);

  const utils = trpc.useContext();

  const { mutate } = trpc.reply.post.useMutation({
    onSuccess: () => {
      utils.build.getOne.invalidate({ id: buildId });
      setContent("");
      setIsReplyFormOpen(false);
    },
  });

  const sendReply = () => {
    const replySchema = z.object({
      content: z
        .string()
        .min(10, {
          message: "Reply must be more than 10 characters.",
        })
        .max(100, { message: "Reply must be less than 100 characters." }),
    });

    try {
      replySchema.parse({ content });
      mutate({ content, reviewId, replyId });
    } catch (e) {
      setShowError(true);
    }
  };

  const closeReplyForm = () => {
    setContent("");
    setIsReplyFormOpen(false);
  };

  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <Toast
        isVisible={showError}
        setIsVisible={setShowError}
        message="Reply must be less than 100 characters."
        status="error"
      />
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
          onClick={sendReply}
        />
        <Button
          text="Cancel"
          classNames="p-0 mb-0 hover:text-orange-500"
          variant="plain"
          onClick={closeReplyForm}
        />
      </div>
    </div>
  );
};

export default ReplyForm;
