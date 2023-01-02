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
				${status === "success" ? "bg-green-800 text-green-200" : ""}
				${status === "error" ? "bg-red-800 text-red-200" : ""}
				${status === "warning" ? "bg-yellow-800 text-yellow-200" : ""}
				${status === "info" ? "bg-blue-800 text-blue-200" : ""}
			`}
    >
      {message}
    </div>
  );
};

export default Alert;
