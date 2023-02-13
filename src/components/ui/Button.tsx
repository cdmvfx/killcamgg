type Props = {
  text: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "plain";
  width?: "fit" | "full";
  classNames?: string;
};

const Button = ({
  text,
  onClick,
  icon,
  variant = "primary",
  width = "fit",
  classNames,
}: Props) => {
  const variantClasses = {
    primary:
      "border px-4 py-2 border-orange-600 bg-orange-600 hover:bg-orange-500 ",
    secondary:
      "border px-4 py-2 border-orange-600 bg-transparent hover:text-orange-500",
    tertiary:
      "border px-4 py-2 border-transparent bg-transparent hover:text-orange-500",
    plain: "",
  };

  const widthClasses = {
    fit: "w-fit",
    full: "w-full",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-4 rounded-md font-bold tracking-wide text-white transition-all ${
        variantClasses[variant]
      } ${widthClasses[width]} ${classNames || ""}`}
    >
      {icon}
      {text}
    </button>
  );
};

export default Button;
