type Props = {
  status: "success" | "error" | "warning" | "info";
  message: string;
};

const Alert = (props: Props) => {
  const { status, message } = props;

  return (
    <div
      className={`
				px-4 py-2
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
