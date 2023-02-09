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
      toastStyles += " bg-emerald-600";
      break;
    case "error":
      toastStyles += " bg-red-600";
      break;
    case "info":
      toastStyles += " bg-blue-600";
      break;
    case "warning":
      toastStyles += " bg-yellow-600";
      break;
    default:
      toastStyles += " bg-emerald-600";
  }

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [isVisible, setIsVisible]);

  return (
    <div
      className={`fixed left-0 z-20 flex w-full items-center justify-center text-center text-xl text-white transition-all ${
        isVisible ? toastStylesActive : "-bottom-full"
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
