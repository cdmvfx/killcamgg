import React from "react";

type HeadingProps = {
  children: React.ReactNode;
  primaryAction?: React.ReactNode;
};

const Heading = ({ children, primaryAction }: HeadingProps) => {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="font-jost text-2xl">{children}</h2>
      {primaryAction}
    </div>
  );
};

export default Heading;
