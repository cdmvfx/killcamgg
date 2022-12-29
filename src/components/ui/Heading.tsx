import React from "react";

type HeadingProps = {
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
};

const Heading = ({ children, primaryAction }: HeadingProps) => {
  return (
    <h2 className="mb-2 flex items-center justify-between font-jost text-2xl">
      {children}
      {primaryAction && (
        <button
          className="tertiary mb-0 w-fit p-0 text-sm"
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </button>
      )}
    </h2>
  );
};

export default Heading;
