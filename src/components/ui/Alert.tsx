type Props = {
  status: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
};

const Alert = (props: Props) => {
  const { status, message, className } = props;

  return (
    <div
      className={`
				rounded-md px-4 py-2 ${className}
				${status === "success" ? "bg-green-800 text-white" : ""}
				${status === "error" ? "bg-red-800 text-white" : ""}
				${status === "warning" ? "bg-yellow-800 text-white" : ""}
				${status === "info" ? "bg-blue-800 text-white" : ""}
			`}
    >
      {message}
    </div>
  );
};

export default Alert;
