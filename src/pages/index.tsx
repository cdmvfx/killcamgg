import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import BuildForm from "../components/features/BuildForm";
import BuildsList from "../components/features/BuildList";
import Heading from "../components/ui/Heading";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <main className="flex w-full flex-col items-center px-4 pt-10">
      <h1>Killcam.GG</h1>
      <div className="w-full">
        <div className="mb-4">
          {session ? (
            <>
              <div className="flex flex-col items-center">
                <h2>Hello {session.user?.name}!</h2>
                <button className="tertiary" onClick={() => signOut()}>
                  Logout
                </button>
              </div>
              <BuildForm />
            </>
          ) : (
            <>
              <button onClick={() => signIn("discord")} className="w-full">
                Login with Discord
              </button>
              <button onClick={() => signIn("twitch")} className="w-full">
                Login with Twitch
              </button>
            </>
          )}
        </div>
        <div className="">
          <Heading>Top Rated Builds</Heading>
          <Link href="/builds">
            <button className="mb-4 w-full">View All</button>
          </Link>
          <BuildsList />
        </div>
      </div>
    </main>
  );
};

export default Home;
