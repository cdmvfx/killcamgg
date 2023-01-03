type Props = {
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const StatusBadge = (props: Props) => {
  const { status } = props;

  return (
    <div
      className={`
			${status === "PENDING" ? "bg-neutral-500" : ""} 
			${status === "APPROVED" ? "bg-emerald-500" : ""} 
			${status === "REJECTED" ? "bg-red-500" : ""} 
			w-fit rounded-full px-4`}
    >
      {status}
    </div>
  );
};

export default StatusBadge;
