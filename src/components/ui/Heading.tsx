import React from "react";

type HeadingProps = {
  children: React.ReactNode;
};

const Heading = ({ children }: HeadingProps) => {
  return (
    <div className="mb-4 border-b border-neutral-500 font-cutive text-2xl">
      {children}
    </div>
  );
};

export default Heading;
