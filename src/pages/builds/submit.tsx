import { BuildForm } from "../../components/features/build";

const SubmitPage = () => {
  return (
    <div className="flex flex-col justify-center gap-8 p-4 md:flex-row">
      <div className="basis-full md:basis-1/2">
        <BuildForm />
      </div>
    </div>
  );
};

export default SubmitPage;
