import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import BuildsList from "../components/features/BuildList";
import Heading from "../components/ui/Heading";
import { trpc } from "../utils/trpc";
import SignInButton from "../components/ui/SignInButton";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  const { data: user } = trpc.user.getOne.useQuery({
    id: session?.user?.id ?? null,
  });

  const userFavorites = user
    ? user.favorites.map((favorite) => favorite.id)
    : null;

  const router = useRouter();

  return (
    <main className="flex w-full flex-col items-center px-4 pt-8">
      <div className="w-full">
        {status !== "loading" && !session && (
          <div className="mb-4">
            <SignInButton platform="discord" />
            <SignInButton platform="twitch" />
          </div>
        )}
        <div className="">
          <Heading
            primaryAction={{
              label: "View All",
              onClick: () => router.push("/builds"),
            }}
          >
            Top Rated Builds
          </Heading>
          <BuildsList userFavorites={userFavorites} />
        </div>
      </div>
    </main>
  );
};

export default Home;
