import Panel from "../../components/ui/Panel";
import SignInButton from "../../components/ui/SignInButton";

const SigninPage = () => {
  return (
    <div className="m-auto w-full p-8 md:w-fit md:p-0">
      <Panel>
        <SignInButton platform="discord" />
        <SignInButton platform="twitch" />
      </Panel>
    </div>
  );
};

export default SigninPage;
