import Panel from "../../components/ui/Panel";
import SignInButton from "../../components/ui/SignInButton";

const SigninPage = () => {
  return (
    <div className="m-auto w-full max-w-md p-8 md:p-0">
      <Panel className="flex flex-col gap-5">
        <SignInButton platform="discord" />
        <SignInButton platform="twitch" />
      </Panel>
    </div>
  );
};

export default SigninPage;
