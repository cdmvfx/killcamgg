import { BuildForm } from "../../components/features/build";
import Heading from "../../components/ui/Heading";
import Panel from "../../components/ui/Panel";

const SubmitPage = () => {
  return (
    <div className="flex flex-col gap-8 p-4 md:flex-row">
      <div className="basis-full md:basis-1/2">
        <Panel>
          <Heading>Submission Rules</Heading>
          <div>
            <ol>
              <li>Submission cannot be a duplicate of another build.</li>
              <li>
                Every submission is subject to approval before being made
                public.
              </li>
              <li>Each build must have at least one attachment.</li>
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
