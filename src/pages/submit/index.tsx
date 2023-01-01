import BuildForm from "../../components/features/BuildForm";
import Panel from "../../components/ui/Panel";

const SubmitPage = () => {
  return (
    <div className="flex flex-col gap-8 p-4 md:flex-row">
      <div className="basis-full md:basis-1/2">
        <Panel>
          <h2 className="mb-4">Submission Rules</h2>
          <div>
            <ol>
              <li>Submission cannot be a duplicate of another build.</li>
              <li>
                Every submission is subject to approval before being made
                public.
              </li>
            </ol>
          </div>
        </Panel>
      </div>
      <div className="basis-full md:basis-1/2">
        <BuildForm />
      </div>
    </div>
  );
};

export default SubmitPage;
