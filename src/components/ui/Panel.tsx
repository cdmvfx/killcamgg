const Panel = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  return (
    <div className="panel mb-4 w-full rounded-md bg-black bg-opacity-50 p-4 lg:p-4">
      {children}
    </div>
  );
};

export default Panel;
