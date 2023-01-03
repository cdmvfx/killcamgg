const Panel = ({
  className,
  children,
}: {
  className?: string;
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <div
      className={`panel h-full w-full rounded-md border border-transparent bg-black bg-opacity-50 p-4 transition-all ${className}`}
    >
      {children}
    </div>
  );
};

export default Panel;
