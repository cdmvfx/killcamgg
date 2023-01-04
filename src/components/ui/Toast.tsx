import { useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";

type Props = {
  status: "success" | "error" | "info" | "warning";
  message: string;
  isVisible: boolean;
  setIsVisible: (state: boolean) => void;
};

// Toast component

const Toast = (props: Props) => {
  const { status, message, isVisible, setIsVisible } = props;

  let toastStyles = "";

  const toastStylesActive = "bottom-[50px]";

  switch (status) {
    case "success":
      toastStyles += " bg-emerald-500";
      break;
    case "error":
      toastStyles += " bg-red-500";
      break;
    case "info":
      toastStyles += " bg-blue-500";
      break;
    case "warning":
      toastStyles += " bg-yellow-500";
      break;
    default:
      toastStyles += " bg-emerald-500";
  }

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
  }, [isVisible, setIsVisible]);

  return (
    <div
      className={`clbh9qbe40007j52szbma5k9b fixed -bottom-full left-0 flex w-full items-center justify-center text-center text-xl text-white transition-all ${
        isVisible ? toastStylesActive : ""
      }`}
    >
      <div
        className={`flex items-center  gap-4 rounded-md p-4 shadow-md ${toastStyles}`}
      >
        {message}{" "}
        <IoMdCloseCircle
          className="cursor-pointer"
          onClick={() => setIsVisible(false)}
        />
      </div>
    </div>
  );
};

export default Toast;
