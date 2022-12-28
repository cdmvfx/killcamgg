import React from "react";

const Panel = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const subComponentList = Object.keys(Panel);
  const subComponents = subComponentList.map((key) => {
    return React.Children.map(children, (child) =>
      child.type.name === key ? child : null
    );
  });
  return (
    <div className="panel mb-4 w-full rounded-md bg-black bg-opacity-50 py-4 lg:py-4">
      {subComponents.map((component) => component)}
    </div>
  );
};

const Column = ({ children }: { children: JSX.Element | string }) => {
  return <div className="panel-column px-4 lg:px-4">{children}</div>;
};

Panel.Column = Column;

export default Panel;
