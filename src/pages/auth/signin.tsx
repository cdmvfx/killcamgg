import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import Alert from "../../components/ui/Alert";
import Panel from "../../components/ui/Panel";
import SignInButton from "../../components/ui/SignInButton";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";

const SigninPage = ({}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) => {
  const router = useRouter();

  const { error } = router.query;

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "OAuthAccountNotLinked":
        return "Your account is not linked to this platform. Please use the original method you used to sign in.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  };

  return (
    <div className="m-auto w-full max-w-md p-8 md:p-0">
      <Panel className="flex flex-col gap-2">
        {error && (
          <Alert status="error" message={getErrorMessage(error as string)} />
        )}
        <SignInButton platform="discord" />
        <SignInButton platform="twitch" />
      </Panel>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default SigninPage;
